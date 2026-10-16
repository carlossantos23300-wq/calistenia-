# Catálogo de exercícios

Dados e imagens: Free Exercise DB, de yuhonas e colaboradores.
Fonte: https://github.com/yuhonas/free-exercise-db
Licença: Unlicense (domínio público).
Licença original: https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md

O catálogo contém 876 exercícios com tradução automática para português e algumas revisões manuais de movimentos comuns. As instruções originais em inglês continuam disponíveis para consulta.
As imagens são carregadas da fonte original e precisam de internet. Treinos, favoritos, calendário e progresso sincronizam com a conta autenticada; uma cópia local permite conservar alterações pendentes quando não existe ligação.

## Vídeos de execução

29 exercícios ligados a vídeos disponibilizados pela API pública wger (https://wger.de/api/v2/video/). Os ficheiros originais são reproduzidos diretamente da fonte, sem alterações. Autor, licença Creative Commons e ligação à fonte constam de video-data.js e são apresentados junto do vídeo. Os metadados de referência estão em wger-videos.json e wger-licenses.json. Não existe vídeo associado a todo o catálogo; a disponibilidade e a compatibilidade dependem da fonte e do dispositivo.

## Fotos de movimentos de calistenia (pasta media/)

Fotos de pessoas reais para exercícios que não existem no catálogo. Foram reduzidas e recortadas; nas flexões em pique foram tiradas 4 imagens do GIF original. As fotos com licença CC BY-SA continuam disponíveis com a mesma licença.

- burpee-1.jpg a burpee-7.jpg: Taco fleur, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Burpee_2_Squat.jpg (série "Burpee" 2 a 8)
- pike-push-up-1.jpg a pike-push-up-4.jpg: Danielflefil, CC BY-SA 4.0, https://commons.wikimedia.org/wiki/File:Pike_Push_Ups.gif
- pistol-squat.jpg: Jgcastor, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Pistol-squat.jpg
- l-sit.jpg: Rick McCharles, CC BY 2.0, https://www.flickr.com/photos/71035721@N00/8409521019
- l-sit-rings.jpg: Tommy Gilligan, West Point Public Affairs, domínio público, https://commons.wikimedia.org/wiki/File:West_Point_male_gymnast_L-sit.jpg
- handstand-wall.jpg: garryknight, CC BY 2.0, https://www.flickr.com/photos/8176740@N05/5657942638
- handstand.jpg: Sascha Kohlmann, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Handstand_(142522319).jpeg
- wall-sit.jpg: dennis, CC BY 2.0, https://www.flickr.com/photos/41894190608@N01/4140699165
- bear-crawl.jpg: Brady O'Brien, CC BY-SA 2.0, https://www.flickr.com/photos/7982661@N05/2537144311
- hollow-hold.jpg: Ex Machina 007, CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Hollow_position_.jpg
- muscle-up-top.jpg: Chris Hunkeler, CC BY-SA 2.0, https://www.flickr.com/photos/14913305@N00/52220047716

O autor e a licença de cada foto também aparecem por baixo da imagem na app.

## Calorias pela câmara

- Reconhecimento de pratos: modelo Google AIY Vision Food V1 (2023 pratos), licença Apache 2.0, https://www.kaggle.com/models/google/aiy (ficheiro models/food.tflite). Corre no próprio telemóvel; as fotos não saem do telemóvel.
- Reconhecimento de objetos (frutas e outros alimentos): EfficientNet-Lite0 do MediaPipe (Google), licença Apache 2.0, descarregado de storage.googleapis.com/mediapipe-models.
- Produtos pelo código de barras: Open Food Facts (https://world.openfoodfacts.org), base de dados aberta com licença ODbL. Só o número do código é enviado.
- Leitor de códigos de barras de reserva: ZXing (@zxing/library), licença Apache 2.0, carregado de cdn.jsdelivr.net quando o telemóvel não tem leitor próprio.
- Os valores nutricionais dos alimentos e pratos da app são aproximados (por 100 g) e servem só como estimativa.
