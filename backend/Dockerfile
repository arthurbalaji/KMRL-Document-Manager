FROM openjdk:21-jdk-slim

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Check if the JAR file was created and list target directory contents
RUN ls -la target/ || echo "Target directory not found"

# Find the actual JAR file name
RUN find target -name "*.jar" -type f || echo "No JAR files found"

# Expose port
EXPOSE 8081

# Run the application
CMD ["java", "-jar", "target/document-management-0.0.1-SNAPSHOT.jar"]
