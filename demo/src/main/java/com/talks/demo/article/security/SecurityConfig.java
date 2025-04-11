package com.talks.demo.article.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.jdbc.JdbcDaoImpl;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import javax.sql.DataSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final DataSource dataSource;
    private final JwtRequestFilter jwtRequestFilter; // 引入 JWT 過濾器
    private final JwtUtil jwtUtil; // 需要注入 JwtUtil 用來生成 JWT

    @Autowired
    public SecurityConfig(DataSource dataSource, JwtRequestFilter jwtRequestFilter, JwtUtil jwtUtil) {
        this.dataSource = dataSource;
        this.jwtRequestFilter = jwtRequestFilter;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // 禁用 CSRF
                .authorizeRequests(authz -> authz
                        .requestMatchers("/login", "/register", "/error","/ping").permitAll() // 允許訪問登入和註冊
                        .anyRequest().authenticated() // 其他請求都需要驗證
                )
                .sessionManagement(session -> session
                        // 使用無狀態的 session 策略
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 添加 JWT 過濾器
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        JdbcDaoImpl jdbcDao = new JdbcDaoImpl();
        jdbcDao.setDataSource(dataSource);
        jdbcDao.setUsersByUsernameQuery("SELECT username, password, enabled FROM user WHERE username = ?");
        jdbcDao.setAuthoritiesByUsernameQuery("SELECT username, role FROM user WHERE username = ?");
        return jdbcDao;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance(); // 使用明文密碼編碼器（不建議在生產環境中使用）
        // return new BCryptPasswordEncoder(); // 更安全的選擇，建議使用 BCrypt 編碼器。
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(false); // 設置為 false，這樣可以使用萬用符號
        config.addAllowedOrigin("*"); // 明確允許前端請求來源
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}