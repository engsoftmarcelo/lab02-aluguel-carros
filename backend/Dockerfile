# Back-end TRAÇO (Spring Boot 4 + Java 25) — imagem para hospedagem (ex.: Render).
# Etapa 1: compila o JAR com o Maven Wrapper.
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw && ./mvnw -q -B dependency:go-offline
COPY src src
RUN ./mvnw -q -B -DskipTests package

# Etapa 2: imagem final só com o JRE.
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/target/aluguel-carros-*.jar app.jar
# O provedor informa a porta em $PORT (o application.properties já lê server.port=${PORT:8080}).
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
