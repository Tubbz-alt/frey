"global" "ansiblecfg" "defaults" {}
"global" "ansiblecfg" ssh_connection {
  ssh_args = "-o ControlMaster=auto -o ControlPersist=60s"
}

infra {
  "output" public_address {
    value = "${aws_instance.infra-tusd-server.0.public_dns}"
  }
  "output" public_addresses {
    value = "${join(\\\"\\n\\\", aws_instance.infra-tusd-server.*.public_dns)}"
  }
  "provider" aws {
    access_key = "${var.TSD_AWS_ACCESS_KEY}"
    region = "us-east-1"
    secret_key = "${var.TSD_AWS_SECRET_KEY}"
  }
  "resource" aws_instance "infra-tusd-server" {
    ami = "${lookup(var.ami, var.region)}"
    connection {
      private_key = "${var.TSD_SSH_KEY_FILE}"
      user = "ubuntu"
    }
    instance_type = "c3.large"
    key_name = "${var.TSD_SSH_KEY_NAME}"
    security_groups = ["fw-infra-tusd-main"]
    tags {
      "Name" = "${var.TSD_DOMAIN}"
    }
  }
  "resource" "aws_route53_record" www {
    name = "${var.TSD_DOMAIN}"
    records = ["${aws_instance.infra-tusd-server.public_dns}"]
    ttl = "300"
    type = "CNAME"
    zone_id = "${var.TSD_AWS_ZONE_ID}"
  }
  "resource" aws_security_group "fw-infra-tusd-main" {
    description = "Infra tusd"
    ingress {
      cidr_blocks = ["${var.ip_kevin}", "${var.ip_marius}", "${var.ip_tim}"]
      from_port = "22"
      protocol = "tcp"
      to_port = "22"
    }
    ingress {
      cidr_blocks = ["${var.ip_all}"]
      from_port = "8080"
      protocol = "tcp"
      to_port = "8080"
    }
    name = "fw-infra-tusd-main"
  }
  "variable" "TSD_AWS_ACCESS_KEY" {}
  "variable" "TSD_AWS_SECRET_KEY" {}
  "variable" "TSD_AWS_ZONE_ID" {}
  "variable" "TSD_DOMAIN" {}
  "variable" "TSD_SSH_KEY_FILE" {}
  "variable" "TSD_SSH_KEY_NAM" {}
  "variable" "TSD_SSH_KEY_NAME" {}
  "variable" ip_kevin {
    default = "62.163.187.106/32"
  }
  "variable" ip_marius {
    default = "84.146.5.70/32"
  }
  "variable" ip_tim {
    default = "24.134.75.132/32"
  }
  "variable" ip_all {
    default = "0.0.0.0/0"
  }
  "variable" "ami" default {
    "us-east-1" = "ami-9bce7af0"
  }
  "variable" region {
    default = "us-east-1"
    description = "The region of AWS, for AMI lookups."
  }
}

install {
  playbooks {
    name = "Install infra-tusd-server"
    hosts = "infra-tusd-server"
    tasks {
      name = "Common | Add US APT Mirrors"
      action = "template src=templates/sources.list dest=/etc/apt/sources.list"
      register = "apt_sources"
    }
    tasks {
      name = "Common | Update APT"
      apt = "upgrade=dist cache_valid_time=3600 update_cache=yes dpkg_options='force-confold,force-confdef'"
      when = "apt_sources|changed"
    }
    tasks {
      name = "Common | Install Packages"
      apt = "pkg={{ item }} state=present"
      with_items = ["apg", "build-essential", "curl", "git-core", "htop", "iotop", "libpcre3", "logtail", "mlocate", "mtr", "mysql-client", "psmisc", "telnet", "vim", "wget"]
    }
    tasks {
      name = "Common | Add convenience shortcut wtf"
      action = "lineinfile dest=/home/ubuntu/.bashrc line=\"alias wtf='sudo tail -f /var/log/*{log,err} /var/log/{dmesg,messages,*{,/*}{log,err}}'\""
    }
    tasks {
      name = "tusd | Create approot"
      file = "path=/srv/tusd/current state=directory owner=www-data group=www-data mode=0755 recurse=yes"
    }
    tasks {
      name = "tusd | Download binary"
      action = "copy src=templates/tusd dest=/srv/tusd/current/tusd mode=0755"
    }
    tasks {
      name = "tusd | Create dataroot"
      file = "path=/mnt/tusd-data state=directory owner=www-data group=www-data mode=0755 recurse=yes"
    }
    tasks {
      name = "tusd | Upload environment"
      action = "template src=templates/env dest=/srv/tusd/current/env.sh mode=0600 owner=root group=root"
    }
    tasks {
      name = "tusd | Install upstart file"
      action = "template src=templates/upstart-tusd dest=/etc/init/tusd.conf"
    }
    tasks {
      name = "tusd | Restart"
      action = "service name=tusd state=restarted"
    }
  }
}

