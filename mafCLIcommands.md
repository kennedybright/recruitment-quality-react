Deploy Assets to Alpha:
yarn build:prod
maf-cli deploy --app-token 6b128c4d-0e93-40bd-8461-3fdf8cd0f9d2 --folder-path ./build/usremoterecqa --type assets --assets-zip-path ../usremoterecqa.zip --api-token c575a88fb8f7091e4cc57ebbf84da2a599c17bba --external-gw-url https://externalgw.api.dev.apps.nielsen.com --assets-app-version latest --verbose

Deploy Manifest to Alpha:
yarn build:prod
maf-cli deploy --app-token 6b128c4d-0e93-40bd-8461-3fdf8cd0f9d2 --type manifest --manifest-path ./apps/usremoterecqa/usremoterecqa.json --api-token c575a88fb8f7091e4cc57ebbf84da2a599c17bba --external-gw-url https://externalgw.api.dev.apps.nielsen.com --verbose

Deploy Assets to Production:
yarn build:prod
maf-cli deploy --app-token dfc1e3c4-4fe1-4970-b617-96b8dc1a81a4 --folder-path ./build/usremoterecqa --type assets --assets-zip-path ../usremoterecqa.zip --api-token 4f770afe145a820a081a1300281255df64a51167 --external-gw-url https://externalgw.api.apps.nielsen.com --assets-app-version latest --verbose

Deploy Manifest to Production:
yarn build:prod
maf-cli deploy --app-token dfc1e3c4-4fe1-4970-b617-96b8dc1a81a4 --type manifest --manifest-path ./apps/usremoterecqa/usremoterecqa.json --api-token 4f770afe145a820a081a1300281255df64a51167 --external-gw-url https://externalgw.api.dev.apps.nielsen.com --verbose
