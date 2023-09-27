package com.onlyoffice.authorization.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@SpringBootApplication
public class ApplicationAPI {

	public static void main(String[] args) {
		SpringApplication.run(ApplicationAPI.class, args);
	}

}
