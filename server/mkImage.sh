#!/bin/bash
 rm ./mxBox.tar.gz & tar --dereference -vzcf - ./dist ./Release | openssl  aes-256-cbc -p -nosalt -pass pass:qaqzwswxedec -out ./mxBox.tar.gz