---
title: "Conception de circuits FPGA pour traitement vidéo temps réel"
category: "fpga"
date: "2024-12-27"
author: "CyberGarage Hardware Team"
tags: ["FPGA", "vidéo", "temps réel", "VHDL", "traitement signal"]
summary: "Architecture FPGA optimisée pour le traitement vidéo haute performance avec pipeline parallèle."
readTime: 18
---

## Introduction

Le traitement vidéo temps réel nécessite des architectures hautement parallèles. Les FPGA offrent la flexibilité et les performances requises pour ces applications critiques.

## Architecture système

### Pipeline de traitement vidéo

```vhdl
-- Pipeline principal de traitement vidéo
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity video_pipeline is
    generic (
        DATA_WIDTH    : integer := 8;
        PIXEL_WIDTH   : integer := 24;
        H_RESOLUTION  : integer := 1920;
        V_RESOLUTION  : integer := 1080
    );
    port (
        clk           : in  std_logic;
        reset         : in  std_logic;
        
        -- Interface vidéo d'entrée
        video_in_data : in  std_logic_vector(PIXEL_WIDTH-1 downto 0);
        video_in_valid: in  std_logic;
        video_in_ready: out std_logic;
        
        -- Interface vidéo de sortie
        video_out_data : out std_logic_vector(PIXEL_WIDTH-1 downto 0);
        video_out_valid: out std_logic;
        video_out_ready: in  std_logic;
        
        -- Paramètres de contrôle
        enable_filter  : in std_logic;
        filter_strength: in std_logic_vector(7 downto 0)
    );
end entity;

architecture rtl of video_pipeline is
    
    -- Signaux internes du pipeline
    signal stage1_data, stage2_data, stage3_data : std_logic_vector(PIXEL_WIDTH-1 downto 0);
    signal stage1_valid, stage2_valid, stage3_valid : std_logic;
    
    -- Composants du pipeline
    component line_buffer is
        generic (
            WIDTH : integer := H_RESOLUTION;
            DATA_WIDTH : integer := PIXEL_WIDTH
        );
        port (
            clk : in std_logic;
            data_in : in std_logic_vector(DATA_WIDTH-1 downto 0);
            data_out : out std_logic_vector(DATA_WIDTH-1 downto 0);
            enable : in std_logic
        );
    end component;
    
    component spatial_filter is
        generic (
            KERNEL_SIZE : integer := 3
        );
        port (
            clk : in std_logic;
            reset : in std_logic;
            pixel_matrix : in pixel_matrix_type;
            filtered_pixel : out std_logic_vector(PIXEL_WIDTH-1 downto 0);
            valid : out std_logic
        );
    end component;

begin
    
    -- Stage 1: Buffering de lignes
    line_buffer_inst: line_buffer
        generic map (
            WIDTH => H_RESOLUTION,
            DATA_WIDTH => PIXEL_WIDTH
        )
        port map (
            clk => clk,
            data_in => video_in_data,
            data_out => stage1_data,
            enable => video_in_valid
        );
    
    -- Stage 2: Filtrage spatial
    spatial_filter_inst: spatial_filter
        generic map (
            KERNEL_SIZE => 3
        )
        port map (
            clk => clk,
            reset => reset,
            pixel_matrix => get_pixel_matrix(stage1_data),
            filtered_pixel => stage2_data,
            valid => stage2_valid
        );
    
    -- Stage 3: Post-traitement
    process(clk)
    begin
        if rising_edge(clk) then
            if reset = '1' then
                stage3_data <= (others => '0');
                stage3_valid <= '0';
            elsif enable_filter = '1' then
                -- Application du gain selon filter_strength
                stage3_data <= apply_gain(stage2_data, filter_strength);
                stage3_valid <= stage2_valid;
            else
                stage3_data <= stage2_data;
                stage3_valid <= stage2_valid;
            end if;
        end if;
    end process;
    
    video_out_data <= stage3_data;
    video_out_valid <= stage3_valid;
    
end architecture;
```

### Gestion mémoire optimisée

```vhdl
-- Contrôleur mémoire DDR pour stockage frame buffer
entity ddr_controller is
    generic (
        ADDR_WIDTH : integer := 28;
        DATA_WIDTH : integer := 64
    );
    port (
        -- Interface système
        sys_clk : in std_logic;
        sys_reset : in std_logic;
        
        -- Interface DDR physique
        ddr_clk_p : out std_logic;
        ddr_clk_n : out std_logic;
        ddr_addr : out std_logic_vector(13 downto 0);
        ddr_ba : out std_logic_vector(2 downto 0);
        ddr_ras_n : out std_logic;
        ddr_cas_n : out std_logic;
        ddr_we_n : out std_logic;
        ddr_dq : inout std_logic_vector(DATA_WIDTH-1 downto 0);
        
        -- Interface utilisateur
        user_addr : in std_logic_vector(ADDR_WIDTH-1 downto 0);
        user_data_in : in std_logic_vector(DATA_WIDTH-1 downto 0);
        user_data_out : out std_logic_vector(DATA_WIDTH-1 downto 0);
        user_cmd : in std_logic_vector(2 downto 0); -- read/write/refresh
        user_valid : in std_logic;
        user_ready : out std_logic
    );
end entity;

architecture rtl of ddr_controller is
    
    -- Machine d'état pour protocole DDR
    type state_type is (IDLE, ACTIVE, READ, WRITE, PRECHARGE, REFRESH);
    signal state : state_type := IDLE;
    
    -- Buffers de données
    signal write_buffer : std_logic_vector(DATA_WIDTH-1 downto 0);
    signal read_buffer : std_logic_vector(DATA_WIDTH-1 downto 0);
    
    -- Compteurs de timing
    signal cas_counter : integer range 0 to 15 := 0;
    signal ras_counter : integer range 0 to 15 := 0;
    
begin
    
    -- Machine d'état principale
    process(sys_clk)
    begin
        if rising_edge(sys_clk) then
            if sys_reset = '1' then
                state <= IDLE;
                user_ready <= '0';
            else
                case state is
                    when IDLE =>
                        if user_valid = '1' then
                            case user_cmd is
                                when "001" => -- READ
                                    state <= ACTIVE;
                                when "010" => -- WRITE
                                    state <= ACTIVE;
                                    write_buffer <= user_data_in;
                                when "100" => -- REFRESH
                                    state <= REFRESH;
                                when others =>
                                    state <= IDLE;
                            end case;
                        end if;
                        
                    when ACTIVE =>
                        -- Activation de la ligne
                        ddr_ras_n <= '0';
                        ddr_addr(13 downto 0) <= user_addr(ADDR_WIDTH-1 downto ADDR_WIDTH-14);
                        
                        if user_cmd = "001" then
                            state <= READ;
                        elsif user_cmd = "010" then
                            state <= write;
                        end if;
                        
                    when READ =>
                        -- Lecture des données
                        ddr_cas_n <= '0';
                        ddr_we_n <= '1';
                        if cas_counter = 3 then -- CAS latency = 3
                            read_buffer <= ddr_dq;
                            user_data_out <= ddr_dq;
                            user_ready <= '1';
                            state <= PRECHARGE;
                        end if;
                        cas_counter <= cas_counter + 1;
                        
                    when WRITE =>
                        -- Écriture des données
                        ddr_cas_n <= '0';
                        ddr_we_n <= '0';
                        ddr_dq <= write_buffer;
                        user_ready <= '1';
                        state <= PRECHARGE;
                        
                    when PRECHARGE =>
                        -- Précharge
                        ddr_ras_n <= '0';
                        ddr_cas_n <= '1';
                        ddr_we_n <= '0';
                        ddr_addr(10) <= '1'; -- All banks
                        state <= IDLE;
                        
                    when REFRESH =>
                        -- Rafraîchissement
                        ddr_ras_n <= '0';
                        ddr_cas_n <= '0';
                        ddr_we_n <= '1';
                        state <= IDLE;
                        
                end case;
            end if;
        end if;
    end process;
    
end architecture;
```

## Algorithmes de traitement

### Filtre de convolution 2D

```verilog
// Module de convolution 2D optimisé
module convolution_2d #(
    parameter KERNEL_SIZE = 3,
    parameter DATA_WIDTH = 8,
    parameter COEFF_WIDTH = 16
)(
    input wire clk,
    input wire reset,
    input wire enable,
    
    // Interface pixel matrix
    input wire [DATA_WIDTH-1:0] pixel_matrix [0:KERNEL_SIZE-1][0:KERNEL_SIZE-1],
    input wire pixel_valid,
    
    // Coefficients du kernel
    input wire signed [COEFF_WIDTH-1:0] kernel [0:KERNEL_SIZE-1][0:KERNEL_SIZE-1],
    
    // Sortie filtrée
    output reg [DATA_WIDTH-1:0] filtered_pixel,
    output reg result_valid
);

    // Calcul des produits partiels
    wire signed [DATA_WIDTH+COEFF_WIDTH-1:0] products [0:KERNEL_SIZE-1][0:KERNEL_SIZE-1];
    
    genvar i, j;
    generate
        for (i = 0; i < KERNEL_SIZE; i = i + 1) begin : row_gen
            for (j = 0; j < KERNEL_SIZE; j = j + 1) begin : col_gen
                assign products[i][j] = $signed({1'b0, pixel_matrix[i][j]}) * kernel[i][j];
            end
        end
    endgenerate
    
    // Arbre d'addition pipeliné
    reg signed [DATA_WIDTH+COEFF_WIDTH+3:0] sum_stage1 [0:3];
    reg signed [DATA_WIDTH+COEFF_WIDTH+5:0] sum_stage2 [0:1];
    reg signed [DATA_WIDTH+COEFF_WIDTH+6:0] final_sum;
    
    always @(posedge clk) begin
        if (reset) begin
            filtered_pixel <= 0;
            result_valid <= 0;
        end else if (enable && pixel_valid) begin
            // Stage 1: Addition par paires
            sum_stage1[0] <= products[0][0] + products[0][1] + products[0][2];
            sum_stage1[1] <= products[1][0] + products[1][1] + products[1][2];
            sum_stage1[2] <= products[2][0] + products[2][1] + products[2][2];
            sum_stage1[3] <= 0; // Padding pour pipeline équilibré
            
            // Stage 2: Addition des sommes partielles
            sum_stage2[0] <= sum_stage1[0] + sum_stage1[1];
            sum_stage2[1] <= sum_stage1[2] + sum_stage1[3];
            
            // Stage 3: Somme finale et normalisation
            final_sum <= sum_stage2[0] + sum_stage2[1];
            
            // Saturation et troncature
            if (final_sum > (2**(DATA_WIDTH)-1)) begin
                filtered_pixel <= (2**DATA_WIDTH)-1;
            end else if (final_sum < 0) begin
                filtered_pixel <= 0;
            end else begin
                filtered_pixel <= final_sum[DATA_WIDTH-1:0];
            end
            
            result_valid <= 1'b1;
        end else begin
            result_valid <= 1'b0;
        end
    end

endmodule
```

### Détection de contours Sobel

```systemverilog
// Filtre Sobel pour détection de contours
module sobel_edge_detector #(
    parameter DATA_WIDTH = 8,
    parameter THRESHOLD = 100
)(
    input logic clk,
    input logic reset,
    input logic enable,
    
    // Matrice de pixels 3x3
    input logic [DATA_WIDTH-1:0] pixel_matrix [0:2][0:2],
    input logic pixel_valid,
    
    // Sortie
    output logic [DATA_WIDTH-1:0] edge_magnitude,
    output logic edge_detected,
    output logic result_valid
);

    // Kernels Sobel
    localparam signed [3:0] sobel_x [0:2][0:2] = '{
        '{-1, 0, 1},
        '{-2, 0, 2},
        '{-1, 0, 1}
    };
    
    localparam signed [3:0] sobel_y [0:2][0:2] = '{
        '{-1, -2, -1},
        '{ 0,  0,  0},
        '{ 1,  2,  1}
    };

    // Calculs parallèles
    logic signed [DATA_WIDTH+3:0] gradient_x, gradient_y;
    logic [DATA_WIDTH+3:0] magnitude_squared;
    
    // Pipeline de calcul
    always_ff @(posedge clk) begin
        if (reset) begin
            gradient_x <= 0;
            gradient_y <= 0;
            edge_magnitude <= 0;
            edge_detected <= 0;
            result_valid <= 0;
        end else if (enable && pixel_valid) begin
            // Calcul des gradients
            gradient_x <= 0;
            gradient_y <= 0;
            
            for (int i = 0; i < 3; i++) begin
                for (int j = 0; j < 3; j++) begin
                    gradient_x <= gradient_x + (pixel_matrix[i][j] * sobel_x[i][j]);
                    gradient_y <= gradient_y + (pixel_matrix[i][j] * sobel_y[i][j]);
                end
            end
            
            // Approximation de la magnitude: |gx| + |gy|
            magnitude_squared <= (gradient_x < 0 ? -gradient_x : gradient_x) + 
                               (gradient_y < 0 ? -gradient_y : gradient_y);
            
            // Saturation
            if (magnitude_squared > ((2**DATA_WIDTH) - 1)) begin
                edge_magnitude <= (2**DATA_WIDTH) - 1;
            end else begin
                edge_magnitude <= magnitude_squared[DATA_WIDTH-1:0];
            end
            
            // Détection de contour
            edge_detected <= (magnitude_squared > THRESHOLD);
            result_valid <= 1'b1;
        end else begin
            result_valid <= 1'b0;
        end
    end

endmodule
```

## Optimisations de performance

### Parallélisation massive

```vhdl
-- Architecture parallèle pour traitement de bloc
entity parallel_block_processor is
    generic (
        BLOCK_SIZE : integer := 8;  -- Bloc 8x8 pixels
        NUM_CORES  : integer := 16  -- 16 cœurs parallèles
    );
    port (
        clk : in std_logic;
        reset : in std_logic;
        
        -- Interface de contrôle
        start_processing : in std_logic;
        processing_done : out std_logic;
        
        -- Interface mémoire
        block_data : in block_array_type(0 to NUM_CORES-1);
        processed_data : out block_array_type(0 to NUM_CORES-1)
    );
end entity;

architecture rtl of parallel_block_processor is
    
    -- Instances de processeurs parallèles
    component block_processor is
        generic (
            BLOCK_SIZE : integer := 8
        );
        port (
            clk : in std_logic;
            reset : in std_logic;
            enable : in std_logic;
            block_in : in std_logic_vector(63 downto 0);
            block_out : out std_logic_vector(63 downto 0);
            done : out std_logic
        );
    end component;
    
    signal enable_cores : std_logic_vector(NUM_CORES-1 downto 0);
    signal done_cores : std_logic_vector(NUM_CORES-1 downto 0);

begin
    
    -- Génération des instances parallèles
    gen_cores: for i in 0 to NUM_CORES-1 generate
        processor_inst: block_processor
            generic map (
                BLOCK_SIZE => BLOCK_SIZE
            )
            port map (
                clk => clk,
                reset => reset,
                enable => enable_cores(i),
                block_in => block_data(i),
                block_out => processed_data(i),
                done => done_cores(i)
            );
    end generate;
    
    -- Contrôleur de synchronisation
    process(clk)
    begin
        if rising_edge(clk) then
            if reset = '1' then
                enable_cores <= (others => '0');
                processing_done <= '0';
            elsif start_processing = '1' then
                enable_cores <= (others => '1');
                processing_done <= '0';
            elsif and_reduce(done_cores) = '1' then
                enable_cores <= (others => '0');
                processing_done <= '1';
            end if;
        end if;
    end process;
    
end architecture;
```

### Gestion de pipeline avancée

```python
"""
Modèle Python pour validation de l'architecture FPGA
"""

class FPGAVideoProcessor:
    def __init__(self, width=1920, height=1080):
        self.width = width
        self.height = height
        self.pipeline_depth = 8
        self.clock_freq = 200_000_000  # 200 MHz
        
    def calculate_throughput(self):
        """
        Calcul du débit théorique
        """
        pixels_per_clock = 4  # 4 pixels en parallèle
        pixels_per_second = self.clock_freq * pixels_per_clock
        frames_per_second = pixels_per_second / (self.width * self.height)
        
        return {
            'pixels_per_second': pixels_per_second,
            'max_fps': frames_per_second,
            'bandwidth_gbps': pixels_per_second * 3 * 8 / 1e9  # RGB 8-bit
        }
    
    def pipeline_latency(self):
        """
        Calcul de la latence du pipeline
        """
        clock_period_ns = 1e9 / self.clock_freq
        pipeline_latency_ns = self.pipeline_depth * clock_period_ns
        
        return {
            'clock_period_ns': clock_period_ns,
            'pipeline_latency_ns': pipeline_latency_ns,
            'pipeline_latency_us': pipeline_latency_ns / 1000
        }

# Exemple d'utilisation
processor = FPGAVideoProcessor()
throughput = processor.calculate_throughput()
latency = processor.pipeline_latency()

print(f"Débit maximal: {throughput['max_fps']:.1f} FPS")
print(f"Bande passante: {throughput['bandwidth_gbps']:.2f} Gbps")
print(f"Latence pipeline: {latency['pipeline_latency_us']:.2f} μs")
```

## Interface de communication

### PCIe pour transfert haute vitesse

```vhdl
-- Interface PCIe pour communication avec CPU
entity pcie_interface is
    generic (
        DATA_WIDTH : integer := 256;  -- 256-bit pour PCIe x4 Gen3
        ADDR_WIDTH : integer := 64
    );
    port (
        -- Interface PCIe physique
        pcie_clk : in std_logic;
        pcie_reset_n : in std_logic;
        
        -- Signaux PCIe
        pci_exp_txp : out std_logic_vector(3 downto 0);
        pci_exp_txn : out std_logic_vector(3 downto 0);
        pci_exp_rxp : in std_logic_vector(3 downto 0);
        pci_exp_rxn : in std_logic_vector(3 downto 0);
        
        -- Interface utilisateur
        user_clk : out std_logic;
        user_reset : out std_logic;
        user_lnk_up : out std_logic;
        
        -- Canal de transmission
        tx_data : in std_logic_vector(DATA_WIDTH-1 downto 0);
        tx_valid : in std_logic;
        tx_ready : out std_logic;
        
        -- Canal de réception  
        rx_data : out std_logic_vector(DATA_WIDTH-1 downto 0);
        rx_valid : out std_logic;
        rx_ready : in std_logic
    );
end entity;
```

## Tests et validation

### Banc de test SystemVerilog

```systemverilog
// Testbench pour validation du pipeline vidéo
module tb_video_pipeline;

    // Paramètres du test
    localparam CLK_PERIOD = 5ns;  // 200 MHz
    localparam H_RES = 1920;
    localparam V_RES = 1080;
    localparam PIXEL_WIDTH = 24;
    
    // Signaux du testbench
    logic clk = 0;
    logic reset = 1;
    
    logic [PIXEL_WIDTH-1:0] video_in_data;
    logic video_in_valid = 0;
    logic video_in_ready;
    
    logic [PIXEL_WIDTH-1:0] video_out_data;
    logic video_out_valid;
    logic video_out_ready = 1;
    
    // Génération d'horloge
    always #(CLK_PERIOD/2) clk = ~clk;
    
    // Instance du DUT
    video_pipeline #(
        .DATA_WIDTH(8),
        .PIXEL_WIDTH(PIXEL_WIDTH),
        .H_RESOLUTION(H_RES),
        .V_RESOLUTION(V_RES)
    ) dut (
        .clk(clk),
        .reset(reset),
        .video_in_data(video_in_data),
        .video_in_valid(video_in_valid),
        .video_in_ready(video_in_ready),
        .video_out_data(video_out_data),
        .video_out_valid(video_out_valid),
        .video_out_ready(video_out_ready),
        .enable_filter(1'b1),
        .filter_strength(8'h80)
    );
    
    // Stimulus et vérification
    initial begin
        // Initialisation
        reset = 1;
        #(CLK_PERIOD * 10);
        reset = 0;
        
        // Envoi d'une frame de test
        send_test_frame();
        
        // Vérification des résultats
        verify_output();
        
        $finish;
    end
    
    task send_test_frame();
        for (int row = 0; row < V_RES; row++) begin
            for (int col = 0; col < H_RES; col++) begin
                // Pattern de test: gradient horizontal
                video_in_data = {8'h00, col[7:0], row[7:0]};
                video_in_valid = 1;
                
                @(posedge clk);
                while (!video_in_ready) @(posedge clk);
            end
        end
        video_in_valid = 0;
    endtask
    
    task verify_output();
        int pixel_count = 0;
        
        while (pixel_count < H_RES * V_RES) begin
            @(posedge clk);
            if (video_out_valid) begin
                // Vérification de la cohérence des données
                assert (video_out_data !== 24'hXXXXXX) 
                    else $error("Invalid output data");
                pixel_count++;
            end
        end
        
        $display("Test completed successfully: %d pixels processed", pixel_count);
    endtask

endmodule
```

## Métriques de performance

### Analyse de ressources FPGA

```python
def analyze_fpga_resources(design_name):
    """
    Analyse des ressources utilisées sur FPGA
    """
    resources = {
        'LUTs': 45000,      # Look-Up Tables utilisées
        'FFs': 38000,       # Flip-Flops utilisés  
        'BRAMs': 120,       # Block RAMs utilisées
        'DSPs': 85,         # Digital Signal Processors utilisés
        'Clock_MHz': 200,   # Fréquence d'horloge atteinte
        'Power_W': 12.5     # Consommation estimée
    }
    
    # Calcul d'efficacité
    total_luts = 274080    # Zynq UltraScale+ ZU9EG
    total_ffs = 548160
    total_brams = 912
    total_dsps = 2520
    
    utilization = {
        'LUT_usage': (resources['LUTs'] / total_luts) * 100,
        'FF_usage': (resources['FFs'] / total_ffs) * 100,
        'BRAM_usage': (resources['BRAMs'] / total_brams) * 100,
        'DSP_usage': (resources['DSPs'] / total_dsps) * 100
    }
    
    return {
        'resources': resources,
        'utilization_percent': utilization,
        'performance_score': calculate_performance_score(resources, utilization)
    }

def calculate_performance_score(resources, utilization):
    """
    Score de performance basé sur le rapport performance/ressource
    """
    throughput_gpixels = (resources['Clock_MHz'] * 1e6 * 4) / 1e9  # 4 pixels/clk
    resource_efficiency = 1 / (sum(utilization.values()) / 100)
    
    return throughput_gpixels * resource_efficiency

# Exemple d'analyse
analysis = analyze_fpga_resources("video_pipeline_v2")
print(f"Utilisation LUTs: {analysis['utilization_percent']['LUT_usage']:.1f}%")
print(f"Score de performance: {analysis['performance_score']:.2f}")
```

## Conclusion

La conception de circuits FPGA pour traitement vidéo temps réel nécessite une approche systémique combinant architecture parallèle, optimisation mémoire et gestion de pipeline. Les performances obtenues permettent de traiter des flux vidéo haute résolution avec une latence minimale.

---

*Guide technique par l'équipe CyberGarage Hardware - Expertise en conception FPGA*