## required grip
##      py-27$ pip install grip.
##      py-27$ python gen_md2html.py -d <directory path>
import getopt
import re, shutil, tempfile
import os
import subprocess
import sys

# http://stackoverflow.com/questions/4427542/how-to-do-sed-like-text-replace-with-python
def sed_inplace(filename, pattern, repl):
    '''
    Perform the pure-Python equivalent of in-place `sed` substitution: e.g.,
    `sed -i -e 's/'${pattern}'/'${repl}' "${filename}"`.
    '''
    # For efficiency, precompile the passed regular expression.
    pattern_compiled = re.compile(pattern)

    # For portability, NamedTemporaryFile() defaults to mode "w+b" (i.e., binary
    # writing with updating). This is usually a good thing. In this case,
    # however, binary writing imposes non-trivial encoding constraints trivially
    # resolved by switching to text writing. Let's do that.
    with tempfile.NamedTemporaryFile(mode='w', delete=False) as tmp_file:
        with open(filename) as src_file:
            for line in src_file:
                tmp_file.write(pattern_compiled.sub(repl, line))

    # Overwrite the original file with the munged temporary file in a
    # manner preserving file attributes (e.g., permissions).
    shutil.copystat(filename, tmp_file.name)
    shutil.move(tmp_file.name, filename)


# check argc
if len(sys.argv) < 2:
	print 'Usage: ', sys.argv[0], '-d <docs_directory>'
	sys.exit(1)

# get dir
try:
	opts, args = getopt.getopt(sys.argv[1:], 'd:', ['dir='])
except getopt.GetoptError as ex:
	print str(ex)
	sys.exit(2)

# copy the argument to dir
dir=None
for o, a in opts:
	if o in ('-d', '--dir'):
		dir = os.path.expanduser(a)
		break

print 'Preparing directory: ', dir

# creating directory
try:
	os.makedirs(dir)
except OSError as ex:
	pass

# change cwd to the specified dir
os.chdir(dir)

# set GRIPURL
os.environ['GRIPURL']=dir

# convert md files one-by-one
for f in os.listdir(dir):
	if f.endswith('.md'):
		print 'Converting: ', f
		subprocess.call(['grip', '--export', f])
		baseFile=os.path.splitext(os.path.basename(f))[0];
		htmlFile=baseFile + '.html'
		p=re.compile(dir + '/')
		sed_inplace(f, p, '')
