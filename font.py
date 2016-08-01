import xml.etree.ElementTree as ET
import copy

ET.register_namespace('', 'http://www.w3.org/2000/svg')
PREFIX_MAP = {'svg': 'http://www.w3.org/2000/svg'}

tree = ET.parse('arts/vortex-export.svg')
root = tree.getroot()

print 'Running ...'

def make_copy(tree):
  tree_copy = copy.deepcopy(tree)
  root_copy = tree_copy.getroot()

  # Delete all the g nodes.
  for g_node in root_copy.findall('./svg:g', PREFIX_MAP):
    root_copy.remove(g_node)

  return tree_copy

consonant_root = root.find('.//*[@id="consonants"]')
vowel_root = root.find('.//*[@id="vowels"]')
for consonant_node in consonant_root.findall('.//svg:path', PREFIX_MAP):
  consonant = consonant_node.attrib['id']

  print 'Processing consonant %s' % consonant

  # Now get the vowels.
  for vowel_node in vowel_root.findall('.//svg:path', PREFIX_MAP):
    vowel = vowel_node.attrib['id']
    name = consonant + vowel

    print '  Creating %s' % name
    consonant_copy = copy.deepcopy(consonant_node)
    consonant_copy.attrib['id'] = name
    consonant_copy.attrib['d'] = '%s %s' % (consonant_node.attrib['d'], vowel_node.attrib['d'])

    tree_copy = make_copy(tree)

    tree_copy.getroot().append(consonant_copy)
    tree_copy.write('%s.svg' % name)




# for consonant_node in consonant_root.findall('./*'):
#   print consonant_node.text