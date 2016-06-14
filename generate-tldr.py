import os
import re


PARENT_URL = 'https://github.com/getify/You-Dont-Know-JS/tree/master/'
PARENT_PATH = '.'
BOOK_NAME_ORDER = [
    'up & going',
    'scope & closures',
    'this & object prototypes',
    'types & grammar',
    'async & performance',
    'es6 & beyond'
]
SUMMARY_FILE = open('TLDR.md', 'w+')


def generate_tldr():
    print 'Generating TL;DR'

    add_main_header_to_summary()

    for book_name in BOOK_NAME_ORDER:
        add_book_header_to_summary(book_name)

        files = os.listdir(get_book_path(book_name))

        chapter_files = [file for file in files if chapter_file_match(file)]
        chapter_files.sort()

        for chapter_file_name in chapter_files:
            add_review_to_summary(book_name, chapter_file_name)

        appendix_files = [file for file in files if appendix_file_match(file)]
        appendix_files.sort()

        for appendix_file_name in appendix_files:
            add_review_to_summary(book_name, appendix_file_name)

    print 'Done'


def add_main_header_to_summary():
    SUMMARY_FILE.write('# You Don\'t Know JS: TL;DR  \n')


def add_book_header_to_summary(book_name):
    book_link = '[{}]({})'.format(book_name, get_book_url(book_name))
    SUMMARY_FILE.write('# {}  \n'.format(book_link))


def add_review_to_summary(book_name, file_name):
    path = os.path.join(get_book_path(book_name), file_name)
    text = open(path).read()

    if (review_match(text)):
        add_sub_header_to_summary(book_name, file_name)
        add_text_to_summary(text)


def add_sub_header_to_summary(book_name, file_name):
    file_match = chapter_file_match(file_name) or \
        appendix_file_match(file_name)

    if (file_match):
        sub_header_index = file_match.group(1)
        section_url = get_section_url(book_name, file_name)
        sub_header = '## [{} {}]({})'.format(
            'chapter' if chapter_file_match(file_name) else 'appendix',
            sub_header_index,
            section_url
        )
        SUMMARY_FILE.write(sub_header)


def add_text_to_summary(text):
    review = review_match(text).group(2)
    SUMMARY_FILE.write('{}'.format(remove_tldr_string(review)))


def get_book_path(book_name):
    return os.path.join(PARENT_PATH, book_name)


def get_book_url(book_name):
    return PARENT_URL + book_name


def get_section_url(book_name, section_name):
    return get_book_url(book_name) + '/' + section_name


def chapter_file_match(file):
    return re.match(r'ch(.*)\.md', file, re.I)


def appendix_file_match(file):
    return re.match(r'ap(.*)\.md', file, re.I)


def review_match(text):
    return re.match(r'(.*)## review(.*)', text, re.I | re.S)


def remove_tldr_string(string):
    tldr_string = ' (TL;DR)'
    if tldr_string in string:
        return string.split(tldr_string, 1)[1]
    else:
        return string


generate_tldr()
