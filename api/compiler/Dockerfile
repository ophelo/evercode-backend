FROM frolvlad/alpine-gxx

# COPY run ./tmp

WORKDIR /code

CMD ./run $LANG -f $FILES && ./a.out && rm $FILES

