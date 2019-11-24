PARENT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && cd .. && pwd )
PACKAGE_VERSION=$(node -pe "require('$PARENT_DIR/package.json').version")
PACKAGE_NAME=$(node -pe "require('$PARENT_DIR/package.json').name")
IMAGE_TAG=khaosdoctor/$PACKAGE_NAME:v${1:-$PACKAGE_VERSION}

read -p "Building and publishing $IMAGE_TAG. Press [enter] to continue..."

set -x

docker build $PARENT_DIR -t $IMAGE_TAG
docker push $IMAGE_TAG
