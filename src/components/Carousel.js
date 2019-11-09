import { isComponentType } from './index.js';
import juice from 'juice';


export default (editor, { dc, coreMjmlModel, coreMjmlView }) => {
  const type = 'mj-carousel';

  dc.addType(type, {
    isComponent: isComponentType(type),

    model: {
      ...coreMjmlModel,
      defaults: {
        name: 'Carousel',
        draggable: '[data-gjs-type=mj-column]',
        stylable: [
          'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
          'left-icon', 'right-icon'
        ],
        traits: [{ // make it so that you have to enter text for how many images you want
          label: 'Thumbnail',
          name: 'thumbnails',
          options: [
            { value: 'visible', name: 'Visible' },
            { value: 'hidden', name: 'Hidden' },
          ],
          type: 'select',
        }, {
          label: 'Image Count',
          name: 'image-count',
          options: [
            { value: '1', name: '1' },
            { value: '2', name: '2' },
            { value: '3', name: '3' },
            { value: '4', name: '4' },
            { value: '5', name: '5' },
            { value: '6', name: '6' },
          ],
          changeProp: 1,
          type: 'select',
        }],
      },

      init() {
        coreMjmlView.init.call(this);
        const imageCountTrait = this.getTrait('image-count');
        imageCountTrait.setTargetValue(this.components().models.length);
        this.listenTo(this, 'change:image-count', this.imageCountChanged);
      },

      getChildrenMjml() {
        let code = '';
        this.get('components').each((model) => {
          code += model.toHTML();
        });
        return code;
      },

      imageCountChanged(model, imageCount) {
        const currentImageCount = model.components().models.length;
        if (currentImageCount > imageCount) {
          let imageDeleteCount = currentImageCount - imageCount;
          while (imageDeleteCount > 0) {
            model.components().pop();
            imageDeleteCount--;
          }
        } else if (currentImageCount < imageCount) {
          let imageAddCount = imageCount - currentImageCount;
          while (imageAddCount > 0) {
            model.append(`<mj-carousel-image src="http://placehold.it/350x250/78c5d6/fff"></mj-carousel-image>`);
            imageAddCount--;
          }
        }
        model.view.render();
      },
    },

    view: {
      ...coreMjmlView,

      tagName: 'tr',
      attributes: {
        style: 'font-size:0px;word-break:break-word;pointer-events: all;',
      },

      render(p, c, opts, appendChildren) {
        this.renderAttributes();
        const sandbox = document.createElement('div');
        let mjmlResult = this.getTemplateFromMjmlWithStyle();
        sandbox.innerHTML = mjmlResult.content;
        const carouselEl = sandbox.querySelector('td');

        // make all links unclickable
        carouselEl.querySelectorAll('a').forEach((link) => {
          link.removeAttribute('href');
        });

        // disable all pointer events inside carousel
        carouselEl.querySelectorAll('*').forEach((el) => {
          el.style.pointerEvents = 'none';
        });

        this.el.innerHTML = juice(`<style>${mjmlResult.style}</style>${carouselEl.outerHTML}`);
        this.renderStyle();
        return this;
      },

      getTemplateFromEl(sandboxEl) {
        return sandboxEl.firstChild.querySelector('.mj-column-per-100');
      },

      renderStyle() {
        this.el.style = this.el.getAttribute('style') + this.attributes.style;
      },

      getInnerMjmlTemplate() {
        let innerMjmlTemplate = coreMjmlView.getInnerMjmlTemplate.call(this);
        innerMjmlTemplate.start = `${innerMjmlTemplate.start}${this.model.getChildrenMjml()}`;
        return innerMjmlTemplate;
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-section><mj-column>`,
          end: `</mj-column></mj-section></mj-body></mjml>`,
        };
      },
    },
  });
};
