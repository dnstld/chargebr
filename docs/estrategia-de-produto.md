# Estratégia de produto

## Tese

Profissionais que acompanham a mobilidade elétrica no Brasil não deveriam precisar monitorar, reunir e reconciliar informações fragmentadas entre órgãos públicos, associações, empresas, imprensa e publicações especializadas para entender o mercado.

O ChargeBR transforma essas informações em registros estruturados e conectados, preservando suas fontes e incertezas, para produzir notícias, contexto, dados, análises e alertas úteis.

## Público

O produto é destinado a profissionais e organizações que precisam acompanhar o mercado brasileiro de mobilidade elétrica com mais profundidade, confiança e eficiência.

O público específico de cada oferta será definido e validado conforme o produto evoluir. A fundação deve servir a necessidades comuns: descobrir o que aconteceu, verificar a informação, compreender seu contexto e acompanhar mudanças ao longo do tempo.

## Proposta de valor

O ChargeBR busca reduzir o esforço necessário para transformar informação dispersa em entendimento confiável. O produto deve:

- concentrar acontecimentos relevantes para o Brasil;
- ligar afirmações às fontes que as sustentam;
- distinguir fatos confirmados, interpretações e incertezas;
- conectar acontecimentos relacionados ao longo do tempo;
- permitir análises consistentes sobre mercado, empresas, infraestrutura, dados e regulação.

## Modelo de conteúdo

O produto evolui a partir de três níveis complementares:

**Evento → História → Inteligência**

- **Evento:** representa algo que aconteceu.
- **História:** organiza eventos relacionados em uma sequência compreensível.
- **Inteligência:** combina eventos, histórias, dados e fontes para explicar o que importa e por quê.

Essa progressão permite começar com registros verificáveis e avançar para sínteses sem perder a ligação com as evidências originais.

## Evolução do produto

### 1. Fundação de dados

Construir e validar fontes, metodologia, vocabulário, taxonomia, modelo de dados, controles de qualidade e histórico de coleta.

### 2. Fluxo de inteligência

Executar ciclos de coleta, estruturação, verificação, revisão humana e melhoria. O objetivo é provar que o processo produz informação confiável de forma consistente.

### 3. Produto público de informação

Publicar acontecimentos confiáveis, histórias, contexto de mercado e referências às fontes em uma experiência útil para o público brasileiro.

### 4. Produto pago de inteligência

Oferecer capacidades de maior valor, como alertas personalizados, análises aprofundadas, dados históricos, inteligência regulatória e sobre empresas, painéis e outras ferramentas profissionais.

Cada estágio depende da validação do anterior. Recursos e formatos específicos devem ser decididos a partir de evidências de uso, não apenas de hipóteses.

## Limites

- O mercado atendido é o Brasil.
- Informações estrangeiras entram somente quando possuem relação material demonstrável com o mercado brasileiro.
- O produto e sua saída editorial canônica são em PT-BR.
- Internacionalização e uma versão paralela em inglês não fazem parte do roadmap.
- O idioma original das fontes permanece preservado na proveniência e nas evidências.
- Automação não deve ocultar incertezas nem reduzir os requisitos de rastreabilidade e qualidade.

## Prioridade atual

A fundação de dados e os primeiros ciclos manuais validaram como o ChargeBR representa fontes, conteúdos, observações, acontecimentos, métricas, conflitos e mudanças metodológicas. Uma fronteira privada de leitura também foi instalada para um futuro backend, mas sua identidade operacional permanece sem senha e não será ativada nesta fase.

A prioridade agora é construir o pipeline de coleta antes de escolher runtime ou backend. A primeira fase será manual, local e revisável:

1. modelar `source_endpoints` e `collection_runs`;
2. criar um coletor manual/local;
3. validar conectores iniciais para ABVE e ANEEL;
4. provar deduplicação e idempotência;
5. extrair `observations` como candidatas rastreáveis;
6. manter revisão humana antes da persistência canônica.

Automação agendada, hospedagem, backend, API, frontend e produto público ficam adiados. O runtime será escolhido somente depois que as coletas reais revelarem duração, volume, dependências, frequência, concorrência, segredos e necessidades de observabilidade.
