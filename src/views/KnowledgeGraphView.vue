<template>
  <div id="app" @click="handleOutsideClick">
    <div class="graph-header">
      <h1 class="graph-title">中医针灸知识图谱</h1>
      <div class="graph-description">
        <p>本知识图谱展示了中医经络与穴位的关系网络，帮助您了解经络穴位系统的整体结构。</p>
        <div class="legend">
          <div class="legend-item">
            <span class="legend-dot meridian-dot"></span>
            <span>经络节点</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot acupoint-dot"></span>
            <span>穴位节点</span>
          </div>
        </div>
      </div>
      <div class="control-panel">
        <div class="search-box" @click.stop>
          <input
              v-model="searchQuery"
              placeholder="搜索穴位或经络..."
              class="search-input"
              @input="handleSearch"
              @focus="showSearchResults = true"
          />
          <button class="search-btn" @click="handleSearch">
            <i class="fas fa-search"></i>
          </button>
        </div>
        <div class="view-controls">
          <button class="control-btn" @click="zoomIn" title="放大">
            <i class="fas fa-search-plus"></i>
          </button>
          <button class="control-btn" @click="zoomOut" title="缩小">
            <i class="fas fa-search-minus"></i>
          </button>
          <button class="control-btn" @click="resetView" title="重置视图">
            <i class="fas fa-compress-arrows-alt"></i>
          </button>
          <button class="control-btn" @click="togglePhysics" :class="{ active: physics }">
            <i class="fas fa-atom"></i>
            {{ physics ? '关闭物理引擎' : '开启物理引擎' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="loader"></div>
      <p>知识图谱正在加载，请稍等...</p>
    </div>

    <div id="network"></div>

    <div v-if="searchResults.length > 0 && showSearchResults" class="search-results" @click.stop>
      <div class="search-results-header">
        <h3>搜索结果</h3>
        <button class="close-results-btn" @click="closeSearchResults">×</button>
      </div>
      <ul>
        <li
            v-for="(result, index) in searchResults"
            :key="index"
            @click="focusNode(result.id)"
            class="result-item"
        >
          {{ result.label }}
          <span class="result-type">({{ result.type }})</span>
        </li>
      </ul>
    </div>

    <div v-if="selectedNode" class="popup" :style="popupStyle">
      <div class="popup-header">
        <h3>{{ selectedNode.label }}</h3>
        <button class="close-btn" @click="hidePopup">×</button>
      </div>
      <div class="popup-content">
        <template v-if="selectedNode.labels && selectedNode.labels.includes('Acupoints')">
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <strong>位置：</strong>
            <span>{{ selectedNode.location || '暂无位置信息' }}</span>
          </div>
          <div class="info-item">
            <i class="fas fa-hand-point-up"></i>
            <strong>操作：</strong>
            <span>{{ selectedNode.operation || '暂无操作信息' }}</span>
          </div>
        </template>
        <template v-else>
          <div class="info-item">
            <i class="fas fa-project-diagram"></i>
            <strong>类型：</strong>
            <span>经络</span>
          </div>
          <div class="info-item">
            <i class="fas fa-sitemap"></i>
            <strong>相关穴位数：</strong>
            <span>{{ connectedAcupoints(selectedNode.id) }}</span>
          </div>
        </template>
      </div>
    </div>

    <div class="graph-footer">
      <p>中医针灸穴位知识系统 © {{ new Date().getFullYear() }}</p>
      <p>通过图谱可视化的方式展示经络与穴位之间的关系</p>
    </div>
  </div>
</template>

<script>
import { Network } from 'vis-network/standalone/esm/vis-network';
import {api} from "@/api/index.js";
import {ElMessage} from "element-plus";

export default {
  data() {
    return {
      network: null,
      selectedNode: null,
      popupStyle: {},
      loading: true,
      searchQuery: '',
      searchResults: [],
      showSearchResults: false,
      physics: true,
      allNodes: [],
      graphData: null
    };
  },
  async mounted() {
    var token=localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('请先登录')
      await this.$router.push('/login')
      return
    }else {
      try{
        var status = await api.getLoginStatus()
      }catch (error) {
        status.data="-1";
      }
      if (status.data != "1") {
        ElMessage.warning('请先登录')
        this.$router.push('/login')
        return
      } else {
        this.fetchGraphData();
      }
    }
  },
  methods: {
    async fetchGraphData() {
      this.loading = true;
      try {
        const response = await fetch('/records.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        this.initNetwork(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        ElMessage.error('加载知识图谱数据失败');
        this.loading = false;
      }
    },
    initNetwork(data) {
      const container = document.getElementById('network');
      const nodes = new Map();
      const edges = [];

      data.forEach(record => {
        const startNode = record.p.start;
        const endNode = record.p.end;

        const isMeridian = (node) => node.labels.includes("Meridians");

        if (!nodes.has(startNode.identity)) {
          nodes.set(startNode.identity, {
            id: startNode.identity,
            label: startNode.properties.MeridianName || startNode.properties.AcupointName,
            location: startNode.properties.AcupointLocation || '',
            operation: startNode.properties.Operation || '',
            shape: 'dot',
            size: isMeridian(startNode) ? 60 : 40,
            color: {
              background: isMeridian(startNode) ? '#FFA07A' : '#97C2FC',
              border: isMeridian(startNode) ? '#FF7F50' : '#2B7CE9',
              highlight: {
                background: isMeridian(startNode) ? '#FF8C00' : '#6CAEFF',
                border: isMeridian(startNode) ? '#FF6347' : '#0D68D8'
              }
            },
            font: {
              size: isMeridian(startNode) ? 24 : 20,
              color: '#343434',
              vadjust: 0,
              align: 'center'
            },
            labels: startNode.labels,
            type: isMeridian(startNode) ? '经络' : '穴位'
          });
        }

        if (!nodes.has(endNode.identity)) {
          nodes.set(endNode.identity, {
            id: endNode.identity,
            label: endNode.properties.AcupointName || endNode.properties.MeridianName,
            location: endNode.properties.AcupointLocation || '',
            operation: endNode.properties.Operation || '',
            shape: 'dot',
            size: isMeridian(endNode) ? 60 : 40,
            color: {
              background: isMeridian(endNode) ? '#FFA07A' : '#97C2FC',
              border: isMeridian(endNode) ? '#FF7F50' : '#2B7CE9',
              highlight: {
                background: isMeridian(endNode) ? '#FF8C00' : '#6CAEFF',
                border: isMeridian(endNode) ? '#FF6347' : '#0D68D8'
              }
            },
            font: {
              size: isMeridian(endNode) ? 24 : 20,
              color: '#343434',
              vadjust: 0,
              align: 'center'
            },
            labels: endNode.labels,
            type: isMeridian(endNode) ? '经络' : '穴位'
          });
        }

        edges.push({
          from: startNode.identity,
          to: endNode.identity,
          color: {
            color: '#2B7CE9',
            highlight: '#0D68D8',
            hover: '#0D68D8'
          },
          width: 2,
          smooth: {
            type: 'curvedCW',
            roundness: 0.1
          }
        });
      });

      this.allNodes = Array.from(nodes.values());
      this.graphData = {
        nodes: this.allNodes,
        edges: edges
      };

      const options = {
        nodes: {
          shape: 'dot',
          size: 40,
          font: {
            size: 20,
            align: 'middle'
          },
          color: {
            background: '#97C2FC',
            border: '#2B7CE9'
          },
          borderWidth: 2,
          shadow: {
            enabled: true,
            color: 'rgba(0,0,0,0.2)',
            size: 5
          }
        },
        edges: {
          color: '#2B7CE9',
          width: 2,
          selectionWidth: 2,
          hoverWidth: 2,
          arrows: {
            to: { enabled: false }
          }
        },
        physics: {
          enabled: this.physics,
          solver: 'barnesHut',
          stabilization: {
            enabled: true,
            iterations: 2000,
            updateInterval: 25
          },
          barnesHut: {
            gravitationalConstant: -20000,
            centralGravity: 0.8,
            springLength: 120,
            springConstant: 0.1,
            damping: 0.09
          }
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
          hover: true,
          tooltipDelay: 200,
          keyboard: {
            enabled: true,
            bindToWindow: false
          }
        }
      };

      this.network = new Network(container, this.graphData, options);

      this.network.once('stabilizationIterationsDone', () => {
        this.loading = false;
      });

      this.network.on('click', params => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          this.selectedNode = node;
          const canvasCoords = this.network.getPositions([nodeId])[nodeId];
          const domCoords = this.network.canvasToDOM(canvasCoords);
          this.popupStyle = {
            left: `${domCoords.x}px`,
            top: `${domCoords.y}px`,
          };
        } else {
          this.selectedNode = null;
        }
      });

      this.network.on('hoverNode', params => {
        this.network.canvas.body.container.style.cursor = 'pointer';
      });

      this.network.on('blurNode', params => {
        this.network.canvas.body.container.style.cursor = 'default';
      });
    },
    hidePopup() {
      this.selectedNode = null;
    },
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        this.showSearchResults = false;
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.searchResults = this.allNodes.filter(node =>
          node.label.toLowerCase().includes(query)
      ).slice(0, 10);

      if (this.searchResults.length > 0) {
        this.showSearchResults = true;
      }
    },
    focusNode(id) {
      if (this.network) {
        this.network.focus(id, {
          scale: 1.2,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
        this.network.selectNodes([id]);

        // 找到并显示节点详情
        const node = this.allNodes.find(n => n.id === id);
        if (node) {
          this.selectedNode = node;
          const canvasCoords = this.network.getPositions([id])[id];
          const domCoords = this.network.canvasToDOM(canvasCoords);
          this.popupStyle = {
            left: `${domCoords.x}px`,
            top: `${domCoords.y}px`,
          };

          // 清空搜索结果和搜索框
          this.closeSearchResults();
        }
      }
    },
    closeSearchResults() {
      this.showSearchResults = false;
      this.searchResults = [];
      this.searchQuery = '';
    },
    handleOutsideClick() {
      this.showSearchResults = false;
    },
    zoomIn() {
      if (this.network) {
        const scale = this.network.getScale() * 1.2;
        this.network.moveTo({ scale: scale });
      }
    },
    zoomOut() {
      if (this.network) {
        const scale = this.network.getScale() / 1.2;
        this.network.moveTo({ scale: scale });
      }
    },
    resetView() {
      if (this.network) {
        this.network.fit({
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    },
    togglePhysics() {
      this.physics = !this.physics;
      if (this.network) {
        this.network.setOptions({
          physics: {
            enabled: this.physics
          }
        });
      }
    },
    connectedAcupoints(nodeId) {
      if (!this.network || !nodeId) return 0;

      const connectedNodes = this.network.getConnectedNodes(nodeId);
      return connectedNodes.length;
    }
  }
}
</script>

<style scoped>
#app {
  width: 100%;
  max-width: none;
  position: relative;
  overflow: hidden;
  padding-top: 4.63vh;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f9fafb;
}

.graph-header {
  padding: 1.85vh 1.56vw;
  background: white;
  box-shadow: 0 0.19vh 0.26vw rgba(0, 0, 0, 0.05);
  margin-bottom: 1.85vh;
  border-radius: 0.42vw;
  margin: 0 1.04vw 1.85vh 1.04vw;
}

.graph-title {
  font-size: 1.46vw;
  color: #111827;
  margin: 0 0 1.39vh 0;
  font-weight: 600;
}

.graph-description {
  margin-bottom: 1.85vh;
  color: #4b5563;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.graph-description p {
  margin: 0;
  max-width: 31.25vw;
}

.legend {
  display: flex;
  gap: 1.04vw;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.42vw;
}

.legend-dot {
  width: 0.83vw;
  height: 1.48vh;
  border-radius: 50%;
  display: inline-block;
}

.meridian-dot { background-color: #FFA07A; border: 2px solid #FF7F50; }
.acupoint-dot { background-color: #97C2FC; border: 2px solid #2B7CE9; }

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.85vh;
  flex-wrap: wrap;
  gap: 0.78vw;
}

.search-box {
  display: flex;
  width: 15.63vw;
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.93vh 0.78vw;
  border: 0.05vw solid #e5e7eb;
  border-radius: 0.42vw;
  font-size: 0.73vw;
}

.search-btn {
  position: absolute;
  right: 0.26vw;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.83vw;
}

.view-controls {
  display: flex;
  gap: 0.52vw;
}

.control-btn {
  padding: 0.74vh 0.63vw;
  background: #f3f4f6;
  border: 0.05vw solid #e5e7eb;
  border-radius: 0.42vw;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.26vw;
}

.control-btn:hover { background: #e5e7eb; }

.control-btn.active {
  background: #dbeafe;
  color: #3b82f6;
  border-color: #bfdbfe;
}

#network {
  width: 100%;
  height: 70vh;
  min-height: 55.56vh;
  border: 0.05vw solid #e5e7eb;
  transition: all 0.3s;
  border-radius: 0.42vw;
  overflow: hidden;
  margin: 0 1.04vw;
  background: white;
  box-shadow: 0 0.19vh 0.42vw rgba(0, 0, 0, 0.05);
}

#network:hover {
  box-shadow: 0 0.37vh 0.63vw rgba(0, 0, 0, 0.1);
}

.popup {
  position: absolute;
  background-color: white;
  border-radius: 0.42vw;
  overflow: hidden;
  width: 15.63vw;
  box-shadow: 0 0.37vh 0.78vw rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: all 0.3s;
  transform: translate(-50%, -50%);
}

.popup-header {
  padding: 1.39vh;
  background: #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.05vw solid #e5e7eb;
}

.popup-header h3 {
  margin: 0;
  font-size: 0.94vw;
  color: #111827;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25vw;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

.popup-content {
  padding: 1.39vh;
}

.info-item {
  margin-bottom: 1.11vh;
  display: flex;
  align-items: flex-start;
  gap: 0.52vw;
}

.info-item:last-child { margin-bottom: 0; }

.info-item i {
  color: #3b82f6;
  font-size: 0.83vw;
  margin-top: 0.28vh;
}

.info-item strong {
  color: #4b5563;
  margin-right: 0.26vw;
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  color: #4b5563;
  padding: 1.85vh 1.56vw;
  border-radius: 0.42vw;
  z-index: 1000;
  box-shadow: 0 0.37vh 0.78vw rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.78vw;
}

.loader {
  width: 2.08vw;
  height: 3.70vh;
  border: 0.21vw solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.search-results {
  position: absolute;
  top: 13.43vh;
  left: 2.60vw;
  width: 15.63vw;
  background: white;
  border-radius: 0.42vw;
  box-shadow: 0 0.37vh 0.78vw rgba(0, 0, 0, 0.1);
  padding: 1.39vh;
  z-index: 100;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.93vh;
}

.search-results h3 {
  margin: 0;
  font-size: 0.83vw;
  color: #4b5563;
}

.close-results-btn {
  background: none;
  border: none;
  font-size: 0.94vw;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 0.74vh 0.52vw;
  border-radius: 0.31vw;
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover { background: #f3f4f6; }

.result-type {
  color: #6b7280;
  font-size: 0.63vw;
}

.graph-footer {
  margin-top: 2.78vh;
  padding: 1.85vh;
  text-align: center;
  color: #6b7280;
  font-size: 0.73vw;
  border-top: 0.05vw solid #e5e7eb;
}

.graph-footer p {
  margin: 0.46vh 0;
}

@media (max-width: 768px) {
  #app { padding-top: 3.70vh; }
  .graph-header {
    padding: 1.39vh;
    margin: 0 0.52vw 1.39vh 0.52vw;
  }
  .graph-title { font-size: 1.15vw; }
  .graph-description { flex-direction: column; align-items: flex-start; gap: 0.78vw; }
  .control-panel { flex-direction: column; align-items: flex-start; }
  .search-box { width: 100%; }
  #network { margin: 0 0.52vw; height: 60vh; }
  .popup { width: 90%; max-width: 15.63vw; }
  .search-results {
    width: calc(100% - 1.04vw);
    left: 0.52vw;
    right: 0.52vw;
  }
}
</style>












