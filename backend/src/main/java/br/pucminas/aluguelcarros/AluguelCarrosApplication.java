package br.pucminas.aluguelcarros;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@SpringBootApplication
public class AluguelCarrosApplication {

	public static void main(String[] args) {
		configurarSocketsInternosNoWindows();
		SpringApplication.run(AluguelCarrosApplication.class, args);
	}

	/**
	 * No Windows, o Java usa sockets Unix internos (criados em %TEMP%) para o Selector do Tomcat.
	 * Em algumas máquinas isso falha com "Unable to establish loopback connection".
	 * Usar uma pasta própria do projeto evita o problema. Não altera nada em Linux/macOS
	 * nem quando a propriedade já foi definida manualmente.
	 */
	private static void configurarSocketsInternosNoWindows() {
		String propriedade = "jdk.net.unixdomain.tmpdir";
		boolean windows = System.getProperty("os.name", "").toLowerCase().contains("win");
		if (!windows || System.getProperty(propriedade) != null) {
			return;
		}
		try {
			Path pasta = Files.createDirectories(Path.of(System.getProperty("user.dir"), ".jdk-sock"));
			System.setProperty(propriedade, pasta.toAbsolutePath().toString());
		} catch (IOException e) {
			// mantém o padrão do JDK
		}
	}

}
