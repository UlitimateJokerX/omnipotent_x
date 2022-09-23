#!/bin/sh

type="en"
cno=""
k1=""
k2=""

# Get data
data=$(node cno.js $type $cno $k1 $k2)

# 檢查結果
echo "就是這樣～"$data"～喵!"
