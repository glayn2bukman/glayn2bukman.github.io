#!/bin/bash

SCRIPTPATH=$(dirname `realpath "$0"`)

rsync -rztv "$SCRIPTPATH"/* root@twebale.com:/var/www/html/calc
