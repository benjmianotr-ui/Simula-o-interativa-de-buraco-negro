# Buraco Negro Educativo

Simulação interativa de um buraco negro com uma aula guiada, um laboratório para experimentar e um quiz. Feita apenas com **HTML, CSS e JavaScript**, sem bibliotecas externas.

## Como executar

Abra `Index.html` em um navegador. Não é necessário instalar dependências nem iniciar um servidor.

Para seguir a aula, abra a aba **Aprender** no painel lateral (no celular, o painel fica na parte de baixo da tela) e use os botões **Próxima** e **Anterior**.

## O que tem

| Aba | Conteúdo |
|---|---|
| **Aprender** | 6 lições: o que é um buraco negro, raio de Schwarzschild, lente gravitacional, esfera de fótons, disco de acreção com a última órbita estável, tempo e velocidade de escape |
| **Laboratório** | Massa (de 1 a 10 bilhões de M☉, com atalhos para Sagitário A* e M87*), inclinação do disco, lente gravitacional e círculos que marcam as distâncias importantes |
| **Quiz** | 5 perguntas com explicação de cada resposta e pontuação final |

## Como interagir

- **Clique e arraste** na tela para lançar matéria e ver se ela orbita ou é engolida.
- **Mova o cursor** para ler, no canto superior esquerdo, a distância em rs, a velocidade de escape e o ritmo do tempo naquele ponto.
- **Roda do mouse** muda a massa do buraco negro.
- Nas lições 2, 3 e 5, use os botões dentro do texto para testar cada conceito.

## Tecnologias

- HTML e CSS para o layout e o painel
- JavaScript puro com `<canvas>` para a simulação (gravidade com correção da relatividade geral, lente gravitacional e disco de acreção)

## Estrutura

```
Index.html   # estrutura da página e controles
style.css    # estilos e layout responsivo
script.js    # simulação, lições, laboratório e quiz
README.md    # instruções e descrição do projeto
```

## Aviso

É um modelo simplificado, feito para ensinar. O tamanho na tela não é proporcional à massa real, e a sombra é desenhada com raio igual ao horizonte de eventos. Na imagem real de um buraco negro, a sombra parece cerca de 2,6 vezes maior por causa da lente gravitacional.
