from PIL import Image
import os
import string
import random
from os.path import basename

def resizeImages(baseDir):
    basewidth = 558
    for filename in os.listdir(baseDir):
        filenameOnly, file_extension = os.path.splitext(filename)
        # print (file_extension)
        if (file_extension in [".jpeg", '.jpg']):
            filepath = baseDir + os.sep + filename
            img = Image.open(filepath)
            wpercent = (basewidth/float(img.size[0]))
            hsize = int((float(img.size[1])*float(wpercent)))
            img = img.resize((basewidth,hsize), Image.ANTIALIAS)
            img.save(filepath)
            print (filenameOnly, "Done")
    print('Done')
         
def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
 
def assignRandomNames(baseDir):
    for filename in os.listdir(baseDir):
        filepath = baseDir + os.sep + filename
        if os.path.isfile(filepath):
            finalFolder = baseDir
            filenameOnly, file_extension = os.path.splitext(finalFolder + os.sep + filename)
            os.rename(filepath, finalFolder + os.sep + id_generator()+file_extension)


def createTrainvalTxt(baseDirDataSet):
    buffer = ''
    baseDir = baseDirDataSet+'\images'
    for filename in os.listdir(baseDir):
        filenameOnly, file_extension = os.path.splitext(filename)
        # print (file_extension)
        s = 'images/'+filenameOnly+'.jpg'+' '+'labels/'+filenameOnly+'.xml\n'
        print (repr(s))
        img_file, anno = s.strip("\n").split(" ")
        print(repr(img_file), repr(anno))
        buffer+=s
    with open(baseDirDataSet+'\\structure\\trainval.txt', 'w') as file:
        file.write(buffer)  
    print('Done')   

# Usage
baseDir = "/home/pi/Github/OIP-2021-Team1/cv/training_custom_ssd/data"
createTrainvalTxt(baseDir)
# baseDir = 'dir'