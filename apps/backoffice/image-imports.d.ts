// O que o empacotador desta aplicação devolve num import de imagem. A declaração
// é da aplicação, e não de pacote nenhum: pacote que a declarasse reescreveria o
// programa de tipos de todos os consumidores dele, e foi assim que a atribuição
// de um objeto de imagem a uma referência de imagem compilou e a marca saiu
// quebrada em três documentos emitidos.
//
// `next-env.d.ts` declara isto e é ignorado pelo versionamento, por isso está
// fora da checagem de tipos desta aplicação ("Artefato de construção não é
// conteúdo verificado"). A referência abaixo traz só os tipos de imagem do
// framework — nenhum artefato de construção entra por ela.
//
// Atenção, e é o que explica a afirmação sobre a referência da marca no
// documento emitido: o tipo que o framework declara para `*.svg` é `any`, de
// propósito. `any` entra numa propriedade tipada como cadeia sem reclamação, de
// modo que passar o objeto de imagem em vez da URL compila calado. A guarda
// desse limite é `tests/emitted-document.test.ts`, não o sistema de tipos.
/// <reference types="next/image-types/global" />
