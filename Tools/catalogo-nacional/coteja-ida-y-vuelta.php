<?php
// ================================================================================================
// coteja-ida-y-vuelta.php — la VUELTA de la ida y vuelta, con el código de verdad y sin base.
// ------------------------------------------------------------------------------------------------
// Lo llama Tools/catalogo-nacional/coteja-ida-y-vuelta.js, que ha simulado la IDA —las filas que
// dejarían en la base los generadores de SQL, con los tipos de Database/schema.sql— y necesita saber
// qué JSON sale de esas filas. Ese JSON lo define `buildParkPayload()` (Backend/Lib/park_payload.php)
// y aquí se llama a ESA función, no a una copia. La comparación de valores existe precisamente porque
// la codificación de ida y la de vuelta estaban escritas en dos lenguajes y dejaron de ser inversas
// (`tips`, 2026-09-11): una vuelta reescrita en JavaScript habría llevado el mismo `explode(";")` y
// habría dado el mismo verde.
//
// Para que `buildParkPayload()` corra sin MySQL se le da una conexión simulada que responde a sus
// SELECT con las filas recibidas: la tabla sale del primer FROM y las columnas, de la lista del
// SELECT. Una columna que el SELECT pide y la fila no trae se devuelve a NULL —que es lo que haría la
// base con una columna que ningún generador escribe— y se anota, para que el informe lo diga. No
// filtra ni ordena: el orden no es lo que se compara, y cada consulta es de un solo espacio.
//
// Entrada (stdin):  {"espacios": [{"slug": "…", "tablas": {"parks": [..], "habitats": [..], …}}]}
// Salida (stdout):  {"<slug>": {"payload": {…}, "sinGenerador": {"<tabla>": ["columna", …]}}}
// ================================================================================================
require_once __DIR__ . "/../../Backend/Lib/park_payload.php";

final class ResultadoSimulado {
    private $filas;
    public function __construct(array $filas) { $this->filas = $filas; }
    public function fetch_assoc() { return array_shift($this->filas); }
}

final class SentenciaSimulada {
    private $filas;
    public function __construct(array $filas) { $this->filas = $filas; }
    public function bind_param(...$args) { return true; }
    public function execute() { return true; }
    public function get_result() { return new ResultadoSimulado($this->filas); }
}

final class ConexionSimulada {
    private $tablas;
    public $sinGenerador = [];
    public function __construct(array $tablas) { $this->tablas = $tablas; }

    public function prepare($sql) {
        if (!preg_match('/^\s*SELECT\s+(.*?)\s+FROM\s+(\w+)/is', $sql, $m)) {
            throw new RuntimeException("Consulta que la simulación no sabe servir: $sql");
        }
        $tabla = $m[2];
        $columnas = array_map(fn($c) => preg_replace('/^\w+\./', '', trim($c)), explode(",", $m[1]));
        $filas = [];
        foreach ($this->tablas[$tabla] ?? [] as $fila) {
            $proyectada = [];
            foreach ($columnas as $c) {
                if (!array_key_exists($c, $fila)) $this->sinGenerador[$tabla][$c] = true;
                $proyectada[$c] = $fila[$c] ?? null;
            }
            $filas[] = $proyectada;
        }
        return new SentenciaSimulada($filas);
    }
}

$entrada = json_decode(stream_get_contents(STDIN), true);
if (!is_array($entrada) || !isset($entrada["espacios"])) {
    fwrite(STDERR, "coteja-ida-y-vuelta.php: la entrada no es el JSON esperado\n");
    exit(2);
}

$salida = [];
foreach ($entrada["espacios"] as $e) {
    $conn = new ConexionSimulada($e["tablas"]);
    $salida[$e["slug"]] = [
        "payload" => buildParkPayload($conn, $e["slug"]),
        "sinGenerador" => array_map("array_keys", $conn->sinGenerador),
    ];
}
echo json_encode($salida, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
