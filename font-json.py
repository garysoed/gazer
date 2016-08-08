import io
import json

# Open the base json
config = json.load(file('base.json', 'r'))
selections = []

def get_icon_length(icon):
  name = icon['tags'][0]
  if name == 'nbsp':
    name = '-'
  return len(name)

# sort the icons
config['iconSets'][0]['icons'].sort(
    key = get_icon_length,
    reverse = True)

id = 0
for icon in config['iconSets'][0]['icons']:
  name = icon['tags'][0]
  selection = {
    'id': icon['id'],
    'name': name,
    'prevSize': 32
  }
  if name == 'nbsp':
    name = '-'

  if len(name) == 1:
    selection['code'] = ord(name)
    selection['tempChar'] = name
  else:
    code = int('e900', 16) + id
    selection['code'] = code
    selection['tempChar'] = unichr(code)
    selection['ligatures'] = name
  selections.append(selection)

  id = id + 1

sorted_selection = sorted(
    selections,
    key=lambda selection: len(selection['name']),
    reverse=True)

order = 2
ordering = {}
for selection in sorted_selection:
  ordering[selection['id']] = order
  order = order + 1

for selection in selections:
  selection['order'] = ordering[selection['id']]

config['iconSets'][0]['selection'] = selections
output = json.dumps(config, ensure_ascii=False, indent=2)

with io.open('vortex.json', 'w', encoding='utf8') as json_file:
  json_file.write(output)