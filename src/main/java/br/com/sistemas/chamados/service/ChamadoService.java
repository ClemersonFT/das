package br.com.sistemas.chamados.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.sistemas.chamados.dto.ChamadoRequest;
import br.com.sistemas.chamados.dto.ChamadoResponse;
import br.com.sistemas.chamados.entity.Categoria;
import br.com.sistemas.chamados.entity.Chamado;
import br.com.sistemas.chamados.entity.Cliente;
import br.com.sistemas.chamados.entity.Prioridade;
import br.com.sistemas.chamados.entity.StatusChamado;
import br.com.sistemas.chamados.entity.Tecnico;
import br.com.sistemas.chamados.exception.RecursoNaoEncontradoException;
import br.com.sistemas.chamados.exception.RegraNegocioException;
import br.com.sistemas.chamados.repository.ChamadoRepository;

@Service
public class ChamadoService {

    private final ChamadoRepository repository;
    private final ClienteService clienteService;
    private final CategoriaService categoriaService;
    private final TecnicoService tecnicoService;

    public ChamadoService(ChamadoRepository repository, ClienteService clienteService,
                          CategoriaService categoriaService, TecnicoService tecnicoService) {
        this.repository = repository;
        this.clienteService = clienteService;
        this.categoriaService = categoriaService;
        this.tecnicoService = tecnicoService;
    }

    @Transactional
    public ChamadoResponse criar(ChamadoRequest dto) {
        Cliente cliente = clienteService.buscarEntity(dto.clienteId());
        Categoria categoria = categoriaService.buscarEntity(dto.categoriaId());
        Chamado salvo = repository.save(
                new Chamado(dto.titulo(), dto.descricao(), dto.prioridade(), cliente, categoria));
        return ChamadoResponse.de(salvo);
    }

    @Transactional(readOnly = true)
    public Page<ChamadoResponse> listar(StatusChamado status, Prioridade prioridade,
                                        Long clienteId, Pageable pageable) {
        return repository.filtrar(status, prioridade, clienteId, pageable).map(ChamadoResponse::de);
    }

    @Transactional(readOnly = true)
    public Page<ChamadoResponse> listarPorCliente(Long clienteId, Pageable pageable) {
        clienteService.buscarEntity(clienteId); // garante 404 se o cliente não existe
        return repository.filtrar(null, null, clienteId, pageable).map(ChamadoResponse::de);
    }

    @Transactional(readOnly = true)
    public ChamadoResponse buscar(Long id) {
        return ChamadoResponse.de(buscarEntity(id));
    }

    @Transactional
    public ChamadoResponse atualizar(Long id, ChamadoRequest dto) {
        Chamado chamado = buscarEntity(id);
        validarNaoFechado(chamado);
        chamado.setTitulo(dto.titulo());
        chamado.setDescricao(dto.descricao());
        chamado.setPrioridade(dto.prioridade());
        chamado.setCategoria(categoriaService.buscarEntity(dto.categoriaId()));
        return ChamadoResponse.de(chamado);
    }

    @Transactional
    public ChamadoResponse atribuir(Long id, Long tecnicoId) {
        Chamado chamado = buscarEntity(id);
        validarNaoFechado(chamado);
        Tecnico tecnico = tecnicoService.buscarEntity(tecnicoId);
        chamado.setTecnico(tecnico);
        return ChamadoResponse.de(chamado);
    }

    @Transactional
    public ChamadoResponse alterarStatus(Long id, StatusChamado novoStatus) {
        Chamado chamado = buscarEntity(id);
        validarNaoFechado(chamado);
        chamado.setStatus(novoStatus);
        if (novoStatus == StatusChamado.FECHADO) {
            chamado.setDataFechamento(LocalDateTime.now());
        }
        return ChamadoResponse.de(chamado);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscarEntity(id));
    }

    public Chamado buscarEntity(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Chamado " + id + " não encontrado"));
    }

    private void validarNaoFechado(Chamado chamado) {
        if (chamado.getStatus() == StatusChamado.FECHADO) {
            throw new RegraNegocioException("Chamado " + chamado.getId() + " está fechado e não pode ser alterado");
        }
    }
}