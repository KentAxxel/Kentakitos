package com.kentakitos.config;

import com.kentakitos.security.entity.Permiso;
import com.kentakitos.security.entity.Rol;
import com.kentakitos.security.entity.Usuario;
import com.kentakitos.security.repository.PermisoRepository;
import com.kentakitos.security.repository.RolRepository;
import com.kentakitos.security.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private PermisoRepository permisoRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        // 1. Crear Permisos Básicos
        Permiso verReportes = crearPermisoSiNoExiste("VER_REPORTES");
        Permiso gestionarUsuarios = crearPermisoSiNoExiste("GESTIONAR_USUARIOS");
        Permiso gestionarPedidos = crearPermisoSiNoExiste("GESTIONAR_PEDIDOS");
        Permiso gestionarInventario = crearPermisoSiNoExiste("GESTIONAR_INVENTARIO");

        // 2. Crear Roles
        Rol rolAdmin = crearRolSiNoExiste("ROLE_ADMIN", Set.of(verReportes, gestionarUsuarios, gestionarPedidos, gestionarInventario));
        Rol rolCajero = crearRolSiNoExiste("ROLE_CAJERO", Set.of(gestionarPedidos));
        Rol rolMesero = crearRolSiNoExiste("ROLE_MESERO", Set.of(gestionarPedidos));

        // 3. Crear Usuario Administrador por Defecto
        if (usuarioRepository.findByUsername("admin").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            // Contraseña encriptada con SHA-256
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombreCompleto("Administrador del Sistema");
            admin.setRol(rolAdmin);
            admin.setActivo(true);
            usuarioRepository.save(admin);
            System.out.println("✅ Usuario 'admin' creado con éxito.");
        }
    }

    private Permiso crearPermisoSiNoExiste(String nombre) {
        return permisoRepository.findByNombre(nombre).orElseGet(() -> {
            Permiso p = new Permiso(nombre);
            return permisoRepository.save(p);
        });
    }

    private Rol crearRolSiNoExiste(String nombre, Set<Permiso> permisos) {
        return rolRepository.findByNombre(nombre).orElseGet(() -> {
            Rol r = new Rol(nombre);
            r.setPermisos(new HashSet<>(permisos));
            return rolRepository.save(r);
        });
    }
}
