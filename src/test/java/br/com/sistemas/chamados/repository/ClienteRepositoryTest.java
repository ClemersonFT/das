package br.com.sistemas.chamados.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

import br.com.sistemas.chamados.entity.Cliente;

@DataJpaTest
class ClienteRepositoryTest {

    @Autowired
    private ClienteRepository repository;

    @Test
    void salvaEGeraId() {
        Cliente salvo = repository.save(new Cliente("Ana", "ana@exemplo.com", "47999999999"));
        assertNotNull(salvo.getId());
    }

    @Test
    void existsByEmail() {
        repository.save(new Cliente("Ana", "ana@exemplo.com", "47999999999"));
        assertTrue(repository.existsByEmail("ana@exemplo.com"));
        assertFalse(repository.existsByEmail("outro@exemplo.com"));
    }

    @Test
    void emailDuplicado_violaUnicidade() {
        repository.saveAndFlush(new Cliente("Ana", "ana@exemplo.com", "47999999999"));
        assertThrows(DataIntegrityViolationException.class,
                () -> repository.saveAndFlush(new Cliente("Outra", "ana@exemplo.com", "47988888888")));
    }
}