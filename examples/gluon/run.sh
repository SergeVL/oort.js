#!/bin/bash
basedir=$(dirname $0)
echo "var data = $(cat $1); $(cat $basedir/$2.js)" | js
