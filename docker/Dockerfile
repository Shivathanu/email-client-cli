FROM mysql:8.0.20

COPY my.cnf /etc/mysql/my.cnf
COPY docker-entrypoint-initdb.d /docker-entrypoint-initdb.d

CMD ["mysqld"]

EXPOSE 3306
