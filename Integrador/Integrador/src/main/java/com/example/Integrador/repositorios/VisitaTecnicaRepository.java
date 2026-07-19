package com.example.Integrador.repositorios;

import com.example.Integrador.modelos.VisitaTecnica;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

//CONSULTAS REPOSIOTORIO BDD PARA LO DE VISITAS TECNICAS
@Repository
public interface VisitaTecnicaRepository extends JpaRepository<VisitaTecnica, Long> {

        @Query("""
                        SELECT v FROM VisitaTecnica v
                        WHERE LOWER(v.usuario) LIKE LOWER(CONCAT('%', :q, '%'))
                           OR CAST(v.id AS string) LIKE CONCAT('%', :q, '%')
                        """)

        List<VisitaTecnica> buscarPorUsuarioOID(@Param("q") String q);

        boolean existsByUsuarioTelefonoAndEstadoIn(
                        String telefono,
                        List<String> estados);

                        //para reportes :
        @Query("""
                        SELECT COUNT(v)
                        FROM VisitaTecnica v
                        WHERE v.fechaSolicitud >= :inicioSemana
                        """)
        long visitasSemana(@Param("inicioSemana") LocalDateTime inicioSemana);

        @Query("""
                        SELECT COUNT(v)
                        FROM VisitaTecnica v
                        WHERE YEAR(v.fechaSolicitud)=:anio
                        AND MONTH(v.fechaSolicitud)=:mes
                        """)
        long visitasMes(
                        @Param("anio") int anio,
                        @Param("mes") int mes);

        long countByEstado(String estado);

        @Query("""
                        SELECT v.especialista, COUNT(v)
                        FROM VisitaTecnica v
                        WHERE v.especialista IS NOT NULL
                        GROUP BY v.especialista
                        ORDER BY COUNT(v) DESC
                        """)
        List<Object[]> rankingEspecialistas();
}