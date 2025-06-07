<template>
  <div id="app" style="width: 100%; max-width: none; position: relative;">
    <div v-if="loading" class="loading">知识图谱正在加载，请稍等...</div>
    <div id="network" style="width: 100%; height: 650px; border: 1px solid lightgray;"></div>
    <div v-if="selectedNode" class="popup" :style="popupStyle">
      <h3>{{ selectedNode.label }}</h3>
      <p><strong>位置：</strong>{{ selectedNode.location }}</p>
      <p><strong>操作：</strong>{{ selectedNode.operation }}</p>
    </div>
  </div>
</template>

<script>
import { Network } from 'vis-network/standalone/esm/vis-network';
import {api} from "@/api/index.js";
import {ElMessage} from "element-plus";
import token from "markdown-it/lib/token.mjs";

export default {
  data() {
    return {
      network: null,
      selectedNode: null,
      popupStyle: {},
      loading: true // 加载状态
    };
  },
  async mounted() {
    var token=localStorage.getItem('token');
    if (!token) {
      ElMessage.warning('请先登录')
      await router.push('/login')
      return
    }else {
      try{
        var status = await api.getLoginStatus()
      }catch (error) {
        status.data="-1";
      }
      if (status.data != "1") {
        ElMessage.warning('请先登录')
        router.push('/login')
        return
      } else {
        this.fetchGraphData();
      }
    }

  },
  methods: {
    async fetchGraphData() {
      this.loading = true; // 开始加载时设置加载状态
      try {
        const response = await fetch('/records.json');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        this.initNetwork(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
        this.loading = false; // 确保在捕获错误时也隐藏加载弹窗
      }
    },
    initNetwork(data) {
      const container = document.getElementById('network');
      const nodes = new Map();
      const edges = [];

      data.forEach(record => {
        const startNode = record.p.start;
        const endNode = record.p.end;

        if (!nodes.has(startNode.identity)) {
          nodes.set(startNode.identity, {
            id: startNode.identity,
            label: startNode.properties.MeridianName || startNode.properties.AcupointName,
            location: startNode.properties.AcupointLocation || '', // 加入位置信息
            operation: startNode.properties.Operation || '', // 加入操作信息
            shape: 'dot', // 使用圆点形状
            size: startNode.labels.includes("Meridians") ? 60 : 40, // 经络节点更大
            color: {
              background: startNode.labels.includes("Meridians") ? '#FFA07A' : '#97C2FC', // 经络节点不同颜色
              border: '#2B7CE9'
            },
            font: {
              size: startNode.labels.includes("Meridians") ? 24 : 20, // 经络节点字体更大
              color: '#343434',
              vadjust: 0, // 垂直调整字体位置，使其居中
              align: 'center' // 确保文字水平居中
            },
            labels: startNode.labels // 添加标签属性
          });
        }

        if (!nodes.has(endNode.identity)) {
          nodes.set(endNode.identity, {
            id: endNode.identity,
            label: endNode.properties.AcupointName,
            location: endNode.properties.AcupointLocation || '', // 加入位置信息
            operation: endNode.properties.Operation || '', // 加入操作信息
            shape: 'dot', // 使用圆点形状
            size: endNode.labels.includes("Meridians") ? 60 : 40, // 经络节点更大
            color: {
              background: endNode.labels.includes("Meridians") ? '#FFA07A' : '#97C2FC', // 经络节点不同颜色
              border: '#2B7CE9'
            },
            font: {
              size: endNode.labels.includes("Meridians") ? 24 : 20, // 经络节点字体更大
              color: '#343434',
              vadjust: 0, // 垂直调整字体位置，使其居中
              align: 'center' // 确保文字水平居中
            },
            labels: endNode.labels // 添加标签属性
          });
        }

        edges.push({
          from: startNode.identity,
          to: endNode.identity,
          color: '#2B7CE9'
        });
      });

      const graphData = {
        nodes: Array.from(nodes.values()),
        edges: edges
      };

      const options = {
        nodes: {
          shape: 'dot', // 使用圆点形状
          size: 40, // 节点大小
          font: {
            size: 20, // 字体大小
            align: 'middle' // 确保文字水平垂直居中
          },
          color: {
            background: '#97C2FC',
            border: '#2B7CE9'
          }
        },
        edges: {
          color: '#2B7CE9',
          width: 2
        },
        physics: {
          enabled: true,
          solver: 'barnesHut',
          stabilization: {
            enabled: true,
            iterations: 2000,
            updateInterval: 25
          },
          barnesHut: {
            gravitationalConstant: -20000, // 增加引力常数，使节点更靠近
            centralGravity: 0.8, // 增加中心引力
            springLength: 120, // 减小弹簧长度
            springConstant: 0.1, // 增大弹簧常数
            damping: 0.09
          }
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true
        }
      };

      this.network = new Network(container, graphData, options);

      // 监听渲染完成事件，确保在完全渲染后才隐藏加载弹窗
      this.network.once('stabilizationIterationsDone', () => {
        this.loading = false; // 完全渲染后隐藏加载弹窗
      });

      this.network.on('click', params => {
        if (params.nodes.length > 0) {
          const nodeId = params.nodes[0];
          const node = nodes.get(nodeId);
          if (!node.labels.includes("Meridians")) { // 只对非经络节点生成弹窗
            this.selectedNode = node;
            const canvasCoords = this.network.getPositions([nodeId])[nodeId];
            const domCoords = this.network.canvasToDOM(canvasCoords);
            this.popupStyle = {
              left: `${domCoords.x}px`,
              top: `${domCoords.y}px`,
              height: '150px', // 设置弹窗高度
              'min-height': '150px' // 确保弹窗的最小高度
            };
          } else {
            this.selectedNode = null;
          }
        } else {
          this.selectedNode = null;
        }
      });
    },
    hidePopup() {
      this.selectedNode = null;
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
}

#network {
  width: 100%;
  height: 90vh;
  border: 0.14vh solid lightgray;
  transition: all 0.2s;
  border-radius: 0.8vw;
  overflow: hidden;
  &:hover {
    box-shadow: 0 0 1vw rgba(0, 0, 0, 0.10);
  }
}

.popup {
  position: absolute;
  background-color: white;
  padding: 1.39vh; /* 10px ≈ 1.39vh */
  border: 0.14vh solid black;
  box-shadow: 0 0.56vh 1.11vh rgba(0, 0, 0, 0.1);
  width: 27.78vw; /* 200px ≈ 27.78vw (基于720px宽的视窗) */
  min-height: auto;
  height: 20.83vh; /* 150px ≈ 20.83vh */
  transition: all 0.2s;
  overflow: hidden;
  &:hover {
    box-shadow: 0 0 1vw rgba(0, 0, 0, 0.10);
  }
}

.loading {
  position: fixed;
  top: 45vh;
  left: 50vw;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1.39vh 2.78vw; /* 10px 20px */
  border-radius: 0.71vh; /* 5px */
  font-size: 2.22vh; /* 16px */
  z-index: 1000;
  transition: all 0.2s;
  &:hover {
    box-shadow: 0 0 1vw rgba(0, 0, 0, 0.10);
  }
}

</style>












