import xml.etree.ElementTree as ET
import copy

ET.register_namespace('', 'http://www.w3.org/2000/svg')
PREFIX_MAP = {'svg': 'http://www.w3.org/2000/svg'}

tree = ET.parse('arts/vortex-export.svg')
root = tree.getroot()

WIDE_CONSONANTS = [
  'k',
  'g',
  'b',
  'p',
  'm',
  'n',
  'f',
  'v',
  'y',
  'w',
]
count = 0

def make_copy(tree):
  tree_copy = copy.deepcopy(tree)
  root_copy = tree_copy.getroot()

  # Delete all the g nodes.
  for g_node in root_copy.findall('./svg:g', PREFIX_MAP):
    root_copy.remove(g_node)

  return tree_copy

def write_tree(tree, node, name):
  tree_copy = make_copy(tree)
  tree_copy.getroot().append(node)
  tree_copy.write('vortex/%s.svg' % name)


consonant_root = root.find('.//*[@id="consonants"]')
punctuation_root = root.find('.//*[@id="punctuations"]')
vowel_root = root.find('.//*[@id="vowels"]')
diph_left_root = root.find('.//*[@id="diphleft"]')
diph_right_root = root.find('.//*[@id="diphright"]')

for consonant_node in consonant_root.findall('.//svg:path', PREFIX_MAP):
  consonant = consonant_node.attrib['id']
  if consonant == 'silent':
    consonant = ''

  # Add the vowels.
  for vowel_node in vowel_root.findall('.//svg:path', PREFIX_MAP):
    vowel = vowel_node.attrib['id']

    # Check if the vowel is wide.
    is_wide = vowel[-5:] == '_wide'
    if is_wide:
      vowel = vowel[0:-5]

    # Check if this is a consonant as a vowel
    if vowel[-2:] == '_v':
      vowel = vowel[0:-2]

    if is_wide == (consonant in WIDE_CONSONANTS):
      continue

    if vowel == 'silent':
      vowel = ''

    name = consonant + vowel

    path = '%s %s' % (consonant_node.attrib['d'], vowel_node.attrib['d'])
    consonant_copy = copy.deepcopy(consonant_node)
    consonant_copy.attrib['id'] = name
    consonant_copy.attrib['d'] = path

    write_tree(tree, consonant_copy, name)
    count = count + 1

  # Add the diphthongs.
  for diph_left_node in diph_left_root.findall('.//svg:path', PREFIX_MAP):
    diph_left = diph_left_node.attrib['id'][0:-3]
    for diph_right_node in diph_right_root.findall('.//svg:path', PREFIX_MAP):
      diph_right = diph_right_node.attrib['id'][0:-3]

      name = consonant + diph_left + diph_right

      path = '%s %s %s' % (consonant_node.attrib['d'],
                           diph_left_node.attrib['d'],
                           diph_right_node.attrib['d'])
      consonant_copy = copy.deepcopy(consonant_node)
      consonant_copy.attrib['id'] = name
      consonant_copy.attrib['d'] = path
      write_tree(tree, consonant_copy, name)
      count = count + 1

# Add the punctuations.
for punctuation_node in punctuation_root.findall('.//svg:path', PREFIX_MAP):
  punctuation_copy = copy.deepcopy(punctuation_node)
  write_tree(tree, punctuation_copy, punctuation_node.attrib['id'])
  count = count + 1

# Add the nbsp
tree_copy = make_copy(tree)
tree_copy.write('vortex/nbsp.svg')
count = count + 1

print '%s SVGs written' % count