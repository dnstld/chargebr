# Casos do piloto

## Decisão

O piloto da fundação usará os três casos abaixo:

| ID | Área principal | Caso |
| --- | --- | --- |
| `PILOT-01` | Regulação | Cadeia normativa do Programa Mover |
| `PILOT-02` | Empresa e infraestrutura | Expansão da rede de recarga rápida da BYD |
| `PILOT-03` | Métrica | Base nacional de recarga publicada pela ABVE e Tupi |

Esses casos são entradas para testes de aceitação. A seleção não importa registros do Notion, não transforma suas estruturas em requisitos e não autoriza carga de dados no Supabase.

## Critérios de seleção

Cada caso:

- possui relação direta e material com o Brasil;
- representa um acontecimento histórico real;
- possui ao menos uma fonte primária acessível;
- exercita uma parte diferente da fundação;
- contém uma dificuldade conhecida que não deve ser escondida;
- pode ser executado com um limite claro, sem ampliar a cobertura do piloto.

## `PILOT-01` — Cadeia normativa do Programa Mover

### Recorte

Reconstruir a sequência formada pela Medida Provisória nº 1.205/2023, pelo encerramento de sua vigência, pela Lei nº 14.902/2024 e pelo Decreto nº 12.435/2025.

O caso deve registrar cada ato e acontecimento separadamente. A relação entre eles precisa ser derivada das fontes oficiais; não se deve pressupor que continuidade temática equivale automaticamente a conversão, substituição ou outra relação jurídica específica.

### Por que foi escolhido

- testa datas de publicação, vigência e produção de efeitos;
- exige preservar estados jurídicos anteriores;
- verifica a distinção entre instrumento regulatório, acontecimento e evidência;
- expõe relações normativas que o modelo atual pode ainda não representar;
- possui fontes primárias oficiais.

### Limite

O caso termina no Decreto nº 12.435/2025. Atos complementares, habilitações de empresas, alterações posteriores e resultados do programa ficam fora desta execução.

### Foco de aceitação

A revisão deve conseguir reconstruir o estado de cada instrumento em cada data sem tratar publicação, vigência, encerramento e regulamentação como sinônimos.

### Fontes iniciais

- [Medida Provisória nº 1.205/2023](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/mpv/mpv1205.htm)
- [Encerramento da vigência da MP nº 1.205](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/congresso/adc-35-mpv1.205.htm)
- [Lei nº 14.902/2024](https://planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14902.htm)
- [Decreto nº 12.435/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/d12435.htm)

## `PILOT-02` — Expansão da rede de recarga rápida da BYD

### Recorte

Representar a publicação da BYD de 24 de março de 2026 que informa 125 carregadores rápidos em operação pública no Brasil e apresenta a expectativa de alcançar 225 pontos até o fim de 2026.

O valor realizado e a expectativa futura devem permanecer como afirmações distintas. A fonte da própria empresa confirma o que ela publicou e o estado que declara, mas não prova antecipadamente que a meta futura será cumprida.

### Por que foi escolhido

- testa uma organização empresarial e sua fonte oficial;
- exercita um acontecimento de expansão de infraestrutura;
- exige separar estado realizado de projeção;
- inclui valores quantitativos com data de referência;
- permite acompanhamento posterior sem depender de cobertura contínua agora.

### Limite

O caso cobre somente as afirmações de 125 carregadores em operação e de expectativa de 225 pontos até o fim de 2026. Outras métricas, tecnologias, metas para 2027 e comparações de liderança ficam fora da execução.

### Foco de aceitação

O título e os registros estruturados não podem transformar a expectativa de 225 pontos em infraestrutura já implantada nem atribuir confirmação independente a uma afirmação sustentada somente pela empresa.

### Fonte inicial

- [BYD alcança 125 carregadores rápidos instalados no Brasil](https://www.byd.com/br/maior-rede-de-recarga-publica-do-pais-byd-alcanca-125-carregadores-rapidos-instalados-em-todo-territorio-nacional)

## `PILOT-03` — Base nacional de recarga da ABVE e Tupi

### Recorte

Representar a atualização referente a fevereiro de 2026 publicada pela ABVE e Tupi. A publicação de março informa 21.061 pontos públicos e semipúblicos; uma atualização posterior da mesma série menciona 21.060 como o total anterior.

As fontes também alternam termos como pontos de recarga, eletropostos e carregadores. O piloto deve preservar os valores e termos originais sem escolher silenciosamente uma unidade canônica nem tratar a diferença de uma unidade como irrelevante.

### Por que foi escolhido

- testa uma publicação de métrica nacional;
- exige registrar período, geografia e origem;
- contém uma divergência entre publicações da própria fonte;
- expõe ambiguidade na entidade contada;
- verifica se incerteza quantitativa permanece visível.

### Limite

O caso não calculará crescimento, cobertura ou proporções derivadas. Também não combinará o valor com outras bases enquanto a unidade de contagem e a divergência não estiverem resolvidas.

### Foco de aceitação

A revisão deve encontrar os dois valores publicados, seus respectivos contextos e a ambiguidade terminológica. Se o modelo atual exigir uma normalização não sustentada, o caso deve ser marcado como lacuna de fundação.

### Fontes iniciais

- [ABVE/Tupi publica 21.061 pontos para fevereiro de 2026](https://abve.org.br/recarga-publica-rapida-cresce-167-em-12-meses-e-ja-atinge-31-dos-21-mil-eletropostos-da-rede/)
- [Atualização posterior menciona 21.060 como o total de fevereiro](https://abve.org.br/recarga-rapida-dc-cresce-33-em-tres-meses-e-puxa-a-expansao-da-rede/)

## Ordem de execução

1. `PILOT-02`, por possuir o recorte mais simples e permitir validar primeiro o fluxo básico de proveniência.
2. `PILOT-03`, para testar divergência quantitativa e normalização defensável.
3. `PILOT-01`, por exigir a reconstrução temporal e relacional mais complexa.

Um caso só começa depois que o anterior tiver revisão concluída e suas lacunas estiverem registradas. Uma lacuna estrutural crítica interrompe a sequência até que exista uma decisão revisada.

## Relação com o material histórico

Os Worked Examples do Notion foram consultados como referência. WE2 e WE3 ajudaram a identificar dificuldades úteis para a nova execução, mas seus registros não serão copiados. WE1 não foi selecionado porque acrescentaria um segundo caso regulatório e deixaria a área empresarial ou de infraestrutura sem cobertura.

Referências históricas não canônicas:

- [Revisão do WE2 no Notion](https://app.notion.com/p/3c9ceb4026d081b59662e2ac19c84d2f)
- [Revisão do WE3 no Notion](https://app.notion.com/p/3c9ceb4026d08119b965f138dd3d9ec8)

## Próxima etapa

Entregar o [pacote de revisão de `PILOT-02`](revisao-pilot-02.md) a uma pessoa que não tenha preparado os registros. A pessoa revisora deve produzir o registro completo usando o [checklist de revisão do piloto](checklist-de-revisao-do-piloto.md). O caso só poderá avançar quando essa revisão independente resultar em `ACCEPTED`.
