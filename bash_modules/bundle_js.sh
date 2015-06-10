#!/usr/bin/env bash
main_js_path="../static/js/"
declare -a list_of_main_js

for filename in $(ls $main_js_path);
do
  if [ -d "$main_js_path$filename" ]
  then
    js_module_path=$main_js_path$filename

    for js_file in $(ls "$main_js_path$filename")
    do
      if [ "$js_file" = "main.js" ]
      then
        list_of_main_js+=" "$js_module_path
      fi
    done
  fi

done

for main_js_file in $list_of_main_js
do

  OLD_IFS="$IFS"
  IFS="/"
  STR_ARRAY=( $main_js_file )
  IFS="$OLD_IFS"

  bundle_name=${STR_ARRAY[@]:(-1)}
  echo "* Deleting old bundle"
  $(rm $main_js_file"/"$bundle_name"_bundle.js")
  echo "* Bundling $main_js_file"
  browserify $main_js_file"/main.js" -o $main_js_file"/"$bundle_name"_bundle.js"
done
echo "done"
