FROM ubuntu:16.04

MAINTAINER Mohamed Nadjib Mami <mami@cs.uni-bonn.de>

RUN set -x && \
    # Install Java 8
    apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends curl vim openjdk-8-jdk-headless apt-transport-https && \
    # install SBT
    echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list && \
    apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823 && \
    apt-get update && \
    apt-get install -y sbt && \
    # cleanup
    apt-get clean

WORKDIR /usr/local

RUN set -x && \
    # Install Sparkall-GUI
    git clone https://github.com/EIS-Bonn/sparkall-gui.git
    #cd sparkall-gui && \
    #sbt run # to generate JAR to submit to spark-submit

WORKDIR /usr/local/sparkall-gui

EXPOSE 9000

CMD sbt run
