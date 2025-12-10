# Создание архива с папкой dist внутри
# Архивируем саму папку dist целиком
Compress-Archive -Path "dist" -DestinationPath "dist.zip" -Force

Write-Host "Архив создан: dist.zip (содержит папку dist)"

