FROM openjdk:8-alpine

COPY target/uberjar/datomic-qbuilder.jar /datomic-qbuilder/app.jar

EXPOSE 3000

CMD ["java", "-jar", "/datomic-qbuilder/app.jar"]
