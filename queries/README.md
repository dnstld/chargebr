# Consultas reutilizáveis

Este diretório contém contratos SQL de leitura e suas verificações independentes.

- arquivos `*.read.sql` produzem saídas estruturadas para consumo interno;
- arquivos `*.verify.sql` comprovam as condições canônicas esperadas;
- as consultas são somente de leitura e não concedem acesso público;
- cada contrato possui escopo e versão explícitos e deve ser revisado antes do uso.

O primeiro contrato cobre a métrica de emplacamentos de veículos leves eletrificados da ABVE em janeiro de 2025 e demonstra como preservar metodologias vigente e anterior sem ocultar valores publicados.
