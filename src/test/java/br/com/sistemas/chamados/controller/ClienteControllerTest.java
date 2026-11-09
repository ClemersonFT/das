package br.com.sistemas.chamados.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import br.com.sistemas.chamados.dto.ClienteResponse;
import br.com.sistemas.chamados.exception.RecursoNaoEncontradoException;
import br.com.sistemas.chamados.exception.RegraNegocioException;
import br.com.sistemas.chamados.service.ChamadoService;
import br.com.sistemas.chamados.service.ClienteService;

@WebMvcTest(ClienteController.class)
class ClienteControllerTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ClienteService service;
    @MockitoBean private ChamadoService chamadoService;

    private static final String BODY_VALIDO =
            "{\"nome\":\"Ana Souza\",\"email\":\"ana@exemplo.com\",\"telefone\":\"47999999999\"}";

    @Test
    void criar_retorna201() throws Exception {
        when(service.criar(any())).thenReturn(
                new ClienteResponse(1L, "Ana Souza", "ana@exemplo.com", "47999999999"));

        mockMvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void criar_dadosInvalidos_retorna400() throws Exception {
        mockMvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"\",\"email\":\"email-invalido\",\"telefone\":\"123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void criar_emailDuplicado_retorna409() throws Exception {
        when(service.criar(any())).thenThrow(new RegraNegocioException("Já existe cliente com o e-mail ana@exemplo.com"));

        mockMvc.perform(post("/clientes").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isConflict());
    }

    @Test
    void buscar_idInexistente_retorna404() throws Exception {
        when(service.buscar(99999L)).thenThrow(new RecursoNaoEncontradoException("Cliente 99999 não encontrado"));

        mockMvc.perform(get("/clientes/99999"))
                .andExpect(status().isNotFound());
    }
}