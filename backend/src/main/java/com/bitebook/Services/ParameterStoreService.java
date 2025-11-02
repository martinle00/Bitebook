package com.bitebook.Services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;
import software.amazon.awssdk.services.ssm.model.GetParameterResponse;
import org.springframework.stereotype.Service;

@Service
public class ParameterStoreService {

    Logger logger = LoggerFactory.getLogger(FeedService.class);

    private final SsmClient ssmClient;

    public ParameterStoreService() {
        this.ssmClient = SsmClient.builder()
                .region(Region.AP_SOUTHEAST_2)
                .build();
    }

    public String getSecret(String parameterName) {
        GetParameterRequest request = GetParameterRequest.builder()
                .name(parameterName)
                .withDecryption(true)
                .build();

        GetParameterResponse response = ssmClient.getParameter(request);
        return response.parameter().value();
    }
}