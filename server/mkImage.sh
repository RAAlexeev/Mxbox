#!/bin/bash
 tar --dereference -vzcf - ./dist | openssl  aes-256-cbc -p -nosalt -pass pass:qaqzwswxedec -out ../mxBox.tar.gz