package com.bitebook;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BitebookApplication {

	public static void main(String[] args) {
		SpringApplication.run(BitebookApplication.class, args);
	}

}
