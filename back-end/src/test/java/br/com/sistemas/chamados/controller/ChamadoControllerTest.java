package br.com.sistemas.chamados.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import br.com.sistemas.chamados.dto.ChamadoDetalheResponse;
import br.com.sistemas.chamados.dto.ChamadoResponse;
import br.com.sistemas.chamados.dto.ComentarioResponse;
import br.com.sistemas.chamados.entity.Prioridade;
import br.com.sistemas.chamados.entity.StatusChamado;
import br.com.sistemas.chamados.exception.RecursoNaoEncontradoException;
import br.com.sistemas.chamados.service.ChamadoService;

@WebMvcTest(ChamadoController.class)
class ChamadoControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ChamadoService service;

    private static final String BODY_VALIDO = """
            {"titulo":"Computador não liga","descricao":"Já testei outra tomada",
             "prioridade":"ALTA","clienteId":1,"categoriaId":1}""";

    @Test
    void criar_retorna201_eStatusAberto() throws Exception {
        when(service.criar(any())).thenReturn(new ChamadoResponse(1L, "Computador não liga", "x",
                LocalDateTime.now(), null, Prioridade.ALTA, StatusChamado.ABERTO, 1L, 1L, null));

        mockMvc.perform(post("/chamados").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ABERTO"));
    }

    @Test
    void criar_dadosInvalidos_retorna400() throws Exception {
        mockMvc.perform(post("/chamados").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"\",\"prioridade\":null,\"clienteId\":null,\"categoriaId\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criar_clienteInexistente_retorna404() throws Exception {
        when(service.criar(any())).thenThrow(new RecursoNaoEncontradoException("Cliente 99999 não encontrado"));

        mockMvc.perform(post("/chamados").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isNotFound());
    }

    @Test
    void buscar_retornaComentariosNoDetalhe() throws Exception {
        ComentarioResponse comentario = new ComentarioResponse(1L, "Troquei a fonte", LocalDateTime.now(), "Carlos", 1L);
        when(service.buscar(1L)).thenReturn(new ChamadoDetalheResponse(
                1L, "Computador não liga", "x", LocalDateTime.now(), null,
                Prioridade.ALTA, StatusChamado.ABERTO, 1L, 1L, null, List.of(comentario)));

        mockMvc.perform(get("/chamados/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comentarios[0].autor").value("Carlos"));
    }
}