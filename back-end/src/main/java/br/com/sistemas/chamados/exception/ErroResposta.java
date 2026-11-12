package br.com.sistemas.chamados.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ErroResposta(
        LocalDateTime momento,
        int statys,
        String erro,
        List<String> detalhes
){}