/// <reference types="vite/client" />
// As URLs dos dois arquivos de marca, para a bancada. A diretiva acima declara
// que um import de asset devolve cadeia, e aqui essa afirmação é verdadeira: a
// bancada é um consumidor Vite de verdade.
//
// Este módulo existe para que a afirmação não more em componente nenhum.
// Componente é alcançável a partir do `exports`, e diretiva de referência em
// arquivo alcançável entra no programa de tipos de quem consome o pacote — o
// defeito que a prova da travessia recusa. Nenhum subpath publicado exporta este
// módulo, e é a própria prova que confere isso.
import horizontal from "./logo-charge-br-horizontal.svg";
import mark from "./logo-charge-br-mark.svg";

export const BRAND_HORIZONTAL_URL: string = horizontal;
export const BRAND_MARK_URL: string = mark;
