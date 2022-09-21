#!/bin/sh

type="de"
cno=""
k1=""
k2=""

# Get data
data=$(node cno.js $type $cno $k1 $k2)

# 檢查結果
echo "就是如此～"$data"～喵!"
