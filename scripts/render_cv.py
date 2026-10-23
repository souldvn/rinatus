import json
from pathlib import Path
import pypdfium2 as pdf
from pypdf import PdfReader

document = pdf.PdfDocument('public/cv_musin.rinat.pdf')
reader = PdfReader('public/cv_musin.rinat.pdf')
output = Path('public/assets/cv')
output.mkdir(parents=True, exist_ok=True)
pages = []
for index, page in enumerate(document):
    width, height = page.get_size()
    bitmap = page.render(scale=3)
    image = bitmap.to_pil()
    filename = f'page-{index + 1}.webp'
    image.save(output / filename, 'WEBP', lossless=True)
    text_page = page.get_textpage()
    links = []
    for ref in reader.pages[index].get('/Annots', []):
        annotation = ref.get_object()
        uri = str(annotation.get('/A', {}).get('/URI', ''))
        if not uri.startswith(('https://', 'http://', 'mailto:', 'tel:')):
            continue
        left, bottom, right, top = map(float, annotation['/Rect'])
        links.append({'href': uri, 'label': text_page.get_text_bounded(left, bottom, right, top).strip() or uri,
                      'left': left / width * 100, 'top': (height - top) / height * 100,
                      'width': (right - left) / width * 100, 'height': (top - bottom) / height * 100})
    pages.append({'src': f'/assets/cv/{filename}', 'width': image.width, 'height': image.height,
                  'text': text_page.get_text_range(), 'links': links})
Path('src/cv-pages.json').write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Rendered {len(pages)} CV pages')
