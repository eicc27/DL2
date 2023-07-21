package com.dl2.userservice.Security;

import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.Claim;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class JWTUtil {
    private final String SECRET = "DeepLearningLearningPlatform";

    public String createToken(Map<String, String> claims) {
        try {

            Algorithm algorithm = Algorithm.HMAC256(SECRET);
            long EXP = 10 * 60 * 24 * 1000L;
            return com.auth0.jwt.JWT.create()
                    .withIssuer("DL2")
                    .withClaim("name", claims.get("name"))
                    .withClaim("email", claims.get("email"))
                    .withExpiresAt(new java.util.Date(System.currentTimeMillis() + EXP))
                    .sign(algorithm);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e);
        }
    }

    public Map<String, Claim> verifyToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(SECRET);
            return com.auth0.jwt.JWT
                    .require(algorithm)
                    .build()
                    .verify(token)
                    .getClaims();
        } catch (JWTVerificationException e) {
            return null;
        }
    }

    public String getUserName(String token) {
        return verifyToken(token).get("name").asString();
    }
}
