set :partials_dir, 'partials'
# Markdown
set :markdown_engine, :redcarpet
set :markdown,
    fenced_code_blocks: true,
    smartypants: true,
    disable_indented_code_blocks: true,
    prettify: true,
    tables: true,
    with_toc_data: true,
    no_intra_emphasis: true

# Assets
set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'
set :images_dir, 'images'
set :fonts_dir, 'fonts'
page "/docs.html", :layout => "docs"

# Activate the syntax highlighter
activate :syntax

# Activate autoprefixer
activate :autoprefixer do |config|
  config.browsers = ['last 2 version', 'Firefox ESR']
  config.cascade  = false
  config.inline   = true
end

# Activate pretty URLs
activate :directory_indexes

# Activate live reload
activate :livereload

# Github pages require relative links
activate :relative_assets
set :relative_links, true

# Build Configuration
configure :build do
  # If you're having trouble with Middleman hanging, commenting
  # out the following two lines has been known to help
  activate :minify_css
  activate :minify_javascript
  # activate :relative_assets
  # activate :asset_hash
  # activate :gzip
end