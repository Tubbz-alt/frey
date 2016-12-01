require 'spec_helper'

describe 'ansible-logrotate::default' do

  describe package('logrotate') do
    it { should be_installed.by('apt') }
  end

end
