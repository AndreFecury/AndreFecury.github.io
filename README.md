# andrefecury.github.io

Portfólio de André Fecury: qualidade de software, engenharia, automação e desenvolvimento.
Publicado com GitHub Pages em **https://andrefecury.github.io**.

## Conceito

**Encontro das Águas · Technology in motion.** O encontro dos rios Negro e Solimões, em Manaus, vira
metáfora de integração: a precisão da qualidade de software encontrando a vontade de construir.
A página é uma narrativa em capítulos guiada pela rolagem.

| Capítulo | O que acontece |
|---|---|
| Introdução | Canvas com as duas águas fluindo, entrada coreografada do nome e parallax em camadas |
| Sobre | Tipografia cinética: as palavras acendem conforme a rolagem |
| Experiência | Capítulo fixo (pin) que revela, uma a uma, as áreas de atuação no SIDIA |
| Tecnologias | Ferramentas agrupadas por contexto real de uso, sem barras de nível |
| Projetos | Faixa horizontal guiada pela rolagem, estudos de caso em modal e índice com filtros |
| Trajetória | Linha do tempo que se desenha com a rolagem |
| GitHub | Repositórios e linguagens pela API pública, com cache e fallback |
| Contato | E-mail com botão de copiar, GitHub e LinkedIn |

Extras: navegação que se esconde ao descer, barra de progresso, menu mobile, terminal opcional
(`help`, `about`, `experience`, `skills`, `projects`, `open <n>`, `github`, `contact`, `clear`).

## Tecnologia

- HTML, CSS e JavaScript puros, sem build: o GitHub Pages serve os arquivos como estão.
- [GSAP 3.12 + ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) hospedados em `assets/vendor/`
  para pin, scrub, faixa horizontal e revelações.
- Rolagem nativa do navegador (sem Lenis): teclado, touch, trackpad e leitores de tela funcionam como sempre.
- Canvas 2D para as águas do início (sem WebGL), pausado fora da tela e com menos partículas em aparelhos modestos.
- Fontes: Fraunces, Inter e JetBrains Mono (Google Fonts).

## Acessibilidade e desempenho

- Com `prefers-reduced-motion`, nada fica fixo nem animado: a página vira uma leitura vertical comum.
- Todo o conteúdo existe sem as animações; os efeitos só entram depois que o GSAP carrega.
- HTML semântico, foco visível, `<dialog>` nativo para modal e terminal, link para pular ao conteúdo.
- Em telas menores que 960 px a experiência vira vertical; a faixa de projetos rola com o dedo.
- Lighthouse (modo celular, local): Performance 93, Acessibilidade 100, Boas práticas 96, SEO 100.

## Como atualizar o conteúdo

Tudo fica em **`assets/js/data.js`**: dados pessoais, áreas de experiência, tecnologias, projetos,
filtros, linha do tempo e o retrato do GitHub usado quando a API não responde. O layout lê esse
arquivo, então não é preciso mexer no HTML para incluir um projeto novo.

Imagens dos projetos ficam em `assets/img/` (WebP). Projetos sem imagem real recebem uma
composição abstrata, nunca uma captura inventada.

## Rodando localmente

```bash
git clone https://github.com/AndreFecury/AndreFecury.github.io.git
cd AndreFecury.github.io
python -m http.server 8000      # ou qualquer servidor estático
# abra http://localhost:8000
```

## Publicação

Repositório `AndreFecury.github.io`, branch `main`, pasta raiz. O arquivo `.nojekyll` faz o
GitHub Pages servir os arquivos sem processamento. `404.html`, `robots.txt` e `sitemap.xml` já
estão na raiz.

---

<sub>André Luiz Sales Fecury Filho · Manaus, AM</sub>
