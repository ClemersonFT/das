package br.com.sistemas.chamados.service;

import br.com.sistemas.chamados.dto.ClienteRequest;
import br.com.sistemas.chamados.dto.ClienteResponse;
import br.com.sistemas.chamados.entity.Cliente;
import br.com.sistemas.chamados.exception.RegraNegocioException;
import br.com.sistemas.chamados.repository.ClienteRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public class ClienteService {

    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository){
        this.repository=repository;
    }

    @Transactional
    public ClienteResponse criar(ClienteRequest dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new RegraNegocioException("Já existe cliente com o e-mail" + dto.email());
        }
        Cliente salvo = repository.save(new Cliente(dto.nome(), dto.email(), dto.telefone()));
        return ClienteResponse.de(salvo);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(){
        return repository.findAll().stream().map(ClienteResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id){
        return ClienteResponse.de(buscar(buscarEntity(id));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest dto) {
        Cliente cliente =
    }
}


