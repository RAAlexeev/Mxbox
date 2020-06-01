#!/bin/bash
cd ./dist && tar --dereference -vzcf - ./ | openssl  aes-256-cbc -p -nosalt -pass pass:qaqzwswxedec -out ../mxBox.tar.gz