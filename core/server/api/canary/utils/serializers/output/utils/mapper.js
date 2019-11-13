const _ = require('lodash');
const utils = require('../../../index');
const url = require('./url');
const date = require('./date');
const gating = require('./post-gating');
const clean = require('./clean');
const extraAttrs = require('./extra-attrs');
const postsMetaSchema = require('../../../../../../data/schema').tables.posts_meta;

const mapUser = (model, frame) => {
    const jsonModel = model.toJSON ? model.toJSON(frame.options) : model;

    url.forUser(model.id, jsonModel, frame.options);

    clean.author(jsonModel, frame);

    return jsonModel;
};

const mapTag = (model, frame) => {
    const jsonModel = model.toJSON ? model.toJSON(frame.options) : model;

    url.forTag(model.id, jsonModel, frame.options);
    clean.tag(jsonModel, frame);

    return jsonModel;
};

const mapPost = (model, frame) => {
    const extendedOptions = Object.assign(_.cloneDeep(frame.options), {
        extraProperties: ['canonical_url']
    });

    const jsonModel = model.toJSON(extendedOptions);

    url.forPost(model.id, jsonModel, frame);

    extraAttrs.forPost(frame, model, jsonModel);

    if (utils.isContentAPI(frame)) {
        // Content api v2 still expects page prop
        if (jsonModel.type === 'page') {
            jsonModel.page = true;
        }
        date.forPost(jsonModel);
        gating.forPost(jsonModel, frame);
    }

    clean.post(jsonModel, frame);

    if (frame.options && frame.options.withRelated) {
        frame.options.withRelated.forEach((relation) => {
            // @NOTE: this block also decorates primary_tag/primary_author objects as they
            // are being passed by reference in tags/authors. Might be refactored into more explicit call
            // in the future, but is good enough for current use-case
            if (relation === 'tags' && jsonModel.tags) {
                jsonModel.tags = jsonModel.tags.map(tag => mapTag(tag, frame));
            }

            if (relation === 'authors' && jsonModel.authors) {
                jsonModel.authors = jsonModel.authors.map(author => mapUser(author, frame));
            }
        });
    }

    // Transforms post/page metadata to flat structure
    let metaAttrs = _.keys(_.omit(postsMetaSchema, ['id', 'post_id']));
    _(metaAttrs).filter((k) => {
        return (!frame.options.columns || (frame.options.columns && frame.options.columns.includes(k)));
    }).each((attr) => {
        jsonModel[attr] = _.get(jsonModel.posts_meta, attr) || null;
    });
    delete jsonModel.posts_meta;

    return jsonModel;
};

const mapSettings = (attrs, frame) => {
    url.forSettings(attrs);
    extraAttrs.forSettings(attrs, frame);

    // NOTE: The cleanup of deprecated ghost_head/ghost_foot has to happen here
    //       because codeinjection_head/codeinjection_foot are assigned on a previous
    //      `forSettings` step. This logic can be rewritten once we get rid of deprecated
    //      fields completely.
    if (_.isArray(attrs)) {
        attrs = _.filter(attrs, (o) => {
            return o.key !== 'ghost_head' && o.key !== 'ghost_foot';
        });
    } else {
        delete attrs.ghost_head;
        delete attrs.ghost_foot;
    }

    return attrs;
};

const mapIntegration = (model, frame) => {
    const jsonModel = model.toJSON ? model.toJSON(frame.options) : model;

    if (jsonModel.api_keys) {
        jsonModel.api_keys.forEach((key) => {
            if (key.type === 'admin') {
                key.secret = `${key.id}:${key.secret}`;
            }
        });
    }

    return jsonModel;
};

const mapImage = (path) => {
    return url.forImage(path);
};

const mapAction = (model, frame) => {
    const attrs = model.toJSON(frame.options);
    clean.action(attrs);
    return attrs;
};

const mapMember = (model, frame) => {
    const jsonModel = model.toJSON ? model.toJSON(frame.options) : model;
    return jsonModel;
};

module.exports.mapPost = mapPost;
module.exports.mapUser = mapUser;
module.exports.mapTag = mapTag;
module.exports.mapIntegration = mapIntegration;
module.exports.mapSettings = mapSettings;
module.exports.mapImage = mapImage;
module.exports.mapAction = mapAction;
module.exports.mapMember = mapMember;