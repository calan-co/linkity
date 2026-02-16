#!/bin/bash
# https://medium.com/@jeevansathisocial/extract-subdirectory-from-git-repository-without-losing-history-3de8aed359a4
git subtree split --prefix=linkity/ -b linkity
git checkout linkity
# git remote add linkity <target-repository-url>
git clone --single-branch --branch linkity <repository_url> <new_repository_directory>
